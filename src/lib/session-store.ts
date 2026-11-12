import type { PublicSessionState, SessionState } from "@/types/session";

const SESSION_TTL = 60 * 60 * 4; // 4 ore in secondi
const LOCK_TTL_MS = 5000; // scadenza del lock, se il processo che lo tiene si interrompe
const LOCK_RETRY_MS = 50;
const LOCK_MAX_WAIT_MS = 5000;

// Rilascia il lock solo se appartiene ancora a chi lo ha preso
const RELEASE_LOCK_SCRIPT =
  'if redis.call("get", KEYS[1]) == ARGV[1] then return redis.call("del", KEYS[1]) else return 0 end';

// Fallback in-memory per sviluppo locale senza Redis
const memoryStore = new Map<string, SessionState>();

const parseJSON = (val: string | null): unknown => {
  if (val === null) return null;
  try {
    return JSON.parse(val);
  } catch {
    return null;
  }
};

// Singleton ioredis — evita connessioni multiple per invocazione serverless
let _redis: import("ioredis").Redis | null = null;

async function getRedis() {
  // Produzione: Upstash Redis REST API
  if (process.env.KV_REST_API_URL) {
    const { Redis } = await import("@upstash/redis");
    const kv = new Redis({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN ?? "",
    });
    return {
      get: (key: string) => kv.get<SessionState>(key),
      set: (key: string, val: unknown) => kv.set(key, val, { ex: SESSION_TTL }),
      setEx: (key: string, val: unknown, ttl: number) =>
        kv.set(key, val, { ex: ttl }),
      getValue: (key: string) => kv.get<unknown>(key),
      take: (key: string) => kv.getdel<unknown>(key),
      del: (key: string) => kv.del(key),
      lpush: (key: string, val: string) => kv.lpush(key, val),
      lrange: (key: string, start: number, end: number) =>
        kv.lrange(key, start, end),
      acquireLock: async (key: string, token: string) =>
        (await kv.set(key, token, { nx: true, px: LOCK_TTL_MS })) === "OK",
      releaseLock: async (key: string, token: string) => {
        await kv.eval(RELEASE_LOCK_SCRIPT, [key], [token]);
      },
    };
  }

  // Sviluppo locale: Redis diretto via ioredis (docker-compose)
  if (process.env.REDIS_URL) {
    if (!_redis) {
      const { default: Redis } = await import("ioredis");
      _redis = new Redis(process.env.REDIS_URL);
    }
    const client = _redis;
    return {
      get: async (key: string): Promise<SessionState | null> => {
        const val = await client.get(key);
        try {
          return val ? (JSON.parse(val) as SessionState) : null;
        } catch {
          return null;
        }
      },
      set: async (key: string, val: unknown) => {
        await client.set(key, JSON.stringify(val), "EX", SESSION_TTL);
      },
      setEx: async (key: string, val: unknown, ttl: number) => {
        await client.set(key, JSON.stringify(val), "EX", ttl);
      },
      getValue: async (key: string) => parseJSON(await client.get(key)),
      take: async (key: string) => parseJSON(await client.getdel(key)),
      del: (key: string) => client.del(key),
      lpush: (key: string, val: string) => client.lpush(key, val),
      lrange: (key: string, start: number, end: number) =>
        client.lrange(key, start, end),
      acquireLock: async (key: string, token: string) =>
        (await client.set(key, token, "PX", LOCK_TTL_MS, "NX")) === "OK",
      releaseLock: async (key: string, token: string) => {
        await client.eval(RELEASE_LOCK_SCRIPT, 1, key, token);
      },
    };
  }

  return null; // fallback in-memory
}

export async function getSession(id: string): Promise<SessionState | null> {
  const redis = await getRedis();
  if (redis) return redis.get(`session:${id}`);
  return memoryStore.get(id) ?? null;
}

export async function saveSession(
  id: string,
  state: SessionState,
): Promise<void> {
  state.updatedAt = Date.now();
  const redis = await getRedis();
  if (redis) {
    await redis.set(`session:${id}`, state);
    return;
  }
  memoryStore.set(id, state);
}

export async function deleteSession(id: string): Promise<void> {
  const redis = await getRedis();
  if (redis) {
    await redis.del(`session:${id}`);
    return;
  }
  memoryStore.delete(id);
}

// Lock in memoria: per ogni sessione, la promessa dell'ultima operazione in coda
const memoryLocks = new Map<string, Promise<void>>();

/**
 * Esegue fn in mutua esclusione sulla sessione indicata.
 * Le route che leggono, modificano e riscrivono la sessione devono passare da qui:
 * senza lock, due richieste contemporanee (ad esempio due join) leggono lo stesso
 * stato e l'ultima scrittura cancella la prima.
 * Se il lock non si libera entro LOCK_MAX_WAIT_MS risponde 503.
 */
export async function withSessionLock(
  id: string,
  fn: () => Promise<Response>,
): Promise<Response> {
  const redis = await getRedis();

  if (!redis) {
    const previous = memoryLocks.get(id) ?? Promise.resolve();
    let release = () => {};
    const current = new Promise<void>((resolve) => {
      release = resolve;
    });
    const tail = previous.then(() => current);
    memoryLocks.set(id, tail);
    await previous;
    try {
      return await fn();
    } finally {
      release();
      if (memoryLocks.get(id) === tail) memoryLocks.delete(id);
    }
  }

  const key = `lock:session:${id}`;
  const token = crypto.randomUUID();
  const deadline = Date.now() + LOCK_MAX_WAIT_MS;
  while (!(await redis.acquireLock(key, token))) {
    if (Date.now() > deadline)
      return Response.json({ error: "Session busy" }, { status: 503 });
    await new Promise((r) => setTimeout(r, LOCK_RETRY_MS));
  }
  try {
    return await fn();
  } finally {
    await redis.releaseLock(key, token);
  }
}

export async function pushFeedback(entry: string): Promise<void> {
  const redis = await getRedis();
  if (redis) {
    await redis.lpush("feedback:list", entry);
    return;
  }
  console.log("[FEEDBACK]", entry);
}

/** Restituisce le ultime `count` risposte, oppure tutte se `count` è omesso. */
export async function getFeedback(count?: number): Promise<string[]> {
  const redis = await getRedis();
  if (redis)
    return (await redis.lrange(
      "feedback:list",
      0,
      count === undefined ? -1 : count - 1,
    )) as string[];
  return [];
}

// Accesso alle fotografie FACES (regole concordate con FACES):
// - l'educatore genera un codice monouso, valido FACES_CODE_TTL se non usato;
// - il codice usato all'avvio di una partita diventa un "permesso" (grant)
//   valido quanto una partita (SESSION_TTL);
// - ogni dispositivo che accetta il disclaimer riceve un token legato al
//   permesso: le foto si vedono solo con token e permesso entrambi validi.

/** Durata di un codice non usato: 24 ore. */
export const FACES_CODE_TTL = 60 * 60 * 24;
export const FACES_ACCESS_TTL_SECONDS = SESSION_TTL;

// Fallback in-memory: chiave -> valore e scadenza
const memoryFaces = new Map<string, { value: unknown; expiresAt: number }>();

async function facesSet(key: string, value: unknown, ttl: number) {
  const redis = await getRedis();
  if (redis) {
    await redis.setEx(key, value, ttl);
    return;
  }
  memoryFaces.set(key, { value, expiresAt: Date.now() + ttl * 1000 });
}

function memoryGet(key: string): unknown {
  const entry = memoryFaces.get(key);
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    memoryFaces.delete(key);
    return null;
  }
  return entry.value;
}

async function facesGet(key: string): Promise<unknown> {
  const redis = await getRedis();
  if (redis) return redis.getValue(key);
  return memoryGet(key);
}

/**
 * Legge e cancella in un solo passo (GETDEL; in memoria senza await in mezzo):
 * di due richieste contemporanee solo una trova il valore.
 */
async function facesTake(key: string): Promise<unknown> {
  const redis = await getRedis();
  if (redis) return redis.take(key);
  const value = memoryGet(key);
  memoryFaces.delete(key);
  return value;
}

/** Salva un nuovo codice monouso generato dall'educatore. */
export async function saveFacesCode(code: string): Promise<void> {
  await facesSet(
    `faces-code:${code}`,
    { createdAt: Date.now() },
    FACES_CODE_TTL,
  );
}

/** Partita per cui si usa il codice: schermo singolo o multigiocatore. */
export type FacesGameMode = "single" | "multi";

/** Permesso: la partita a cui è legato (null finché la multigiocatore non parte). */
interface FacesGrant {
  sessionId: string | null;
}

/**
 * Usa un codice: se è valido lo cancella e crea un permesso per la partita.
 * Solo un permesso "multi" può poi essere legato a una partita
 * multigiocatore, e una volta sola (chiave faces-grant-free).
 * @returns l'id del permesso, oppure null se il codice non esiste, è scaduto o è già stato usato
 */
export async function redeemFacesCode(
  code: string,
  mode: FacesGameMode = "single",
): Promise<string | null> {
  const found = await facesTake(`faces-code:${code}`);
  if (found === null) return null;
  const grantId = crypto.randomUUID();
  const grant: FacesGrant = { sessionId: null };
  await facesSet(`faces-grant:${grantId}`, grant, SESSION_TTL);
  if (mode === "multi")
    await facesSet(`faces-grant-free:${grantId}`, true, SESSION_TTL);
  return grantId;
}

export async function isFacesGrantActive(grantId: string): Promise<boolean> {
  return (await facesGet(`faces-grant:${grantId}`)) !== null;
}

/**
 * Lega il permesso a una partita multigiocatore: un codice vale per una sola
 * partita. La chiave faces-grant-free si consuma con GETDEL, quindi tra due
 * avvii contemporanei (anche di partite diverse) ne vince uno solo. Da qui
 * l'accesso dura quanto la partita.
 * @returns true se il permesso era libero (o è già di questa partita)
 */
export async function bindFacesGrant(
  grantId: string,
  sessionId: string,
): Promise<boolean> {
  if (!(await isFacesGrantActive(grantId))) return false;
  if ((await facesTake(`faces-grant-free:${grantId}`)) === null) {
    const grant = (await facesGet(
      `faces-grant:${grantId}`,
    )) as FacesGrant | null;
    return grant?.sessionId === sessionId;
  }
  const grant: FacesGrant = { sessionId };
  await facesSet(`faces-grant:${grantId}`, grant, SESSION_TTL);
  return true;
}

/** Il segreto è dell'host o di un giocatore della partita. */
export function isSessionMember(
  session: SessionState,
  secret: unknown,
): boolean {
  if (typeof secret !== "string" || !secret) return false;
  return (
    secret === session.hostToken ||
    (session.playerSecrets ?? []).includes(secret)
  );
}

/** Registra il disclaimer accettato da un dispositivo, per un permesso. */
export async function grantFacesAccess(
  token: string,
  grantId: string,
): Promise<void> {
  await facesSet(`faces-access:${token}`, grantId, SESSION_TTL);
}

/** Permesso del dispositivo, se il token e il permesso sono ancora validi. */
export async function getFacesAccessGrant(
  token: string,
): Promise<string | null> {
  const grantId = await facesGet(`faces-access:${token}`);
  if (typeof grantId !== "string") return null;
  return (await isFacesGrantActive(grantId)) ? grantId : null;
}

export async function hasFacesAccess(token: string): Promise<boolean> {
  return (await getFacesAccessGrant(token)) !== null;
}

export function toPublicSession(session: SessionState): PublicSessionState {
  const {
    hostToken: _,
    facesGrantId: __,
    playerSecrets: ___,
    ...pub
  } = session;
  return pub;
}
