import type { PublicSessionState, SessionState } from "@/types/session";

const SESSION_TTL = 60 * 60 * 4; // 4 ore in secondi

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
