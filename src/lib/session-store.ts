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

export async function getFeedback(count = 100): Promise<string[]> {
  const redis = await getRedis();
  if (redis)
    return (await redis.lrange("feedback:list", 0, count - 1)) as string[];
  return [];
}

export function toPublicSession(session: SessionState): PublicSessionState {
  const { hostToken: _, ...pub } = session;
  return pub;
}
