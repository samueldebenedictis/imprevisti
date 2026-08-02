import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const kvGet = vi.fn();
const kvSet = vi.fn();
const kvDel = vi.fn();
const kvLpush = vi.fn();
const kvLrange = vi.fn();

vi.mock("@upstash/redis", () => ({
  Redis: vi.fn().mockImplementation(() => ({
    get: kvGet,
    set: kvSet,
    del: kvDel,
    lpush: kvLpush,
    lrange: kvLrange,
  })),
}));

const ioGet = vi.fn();
const ioSet = vi.fn();
const ioDel = vi.fn();
const ioLpush = vi.fn();
const ioLrange = vi.fn();

vi.mock("ioredis", () => ({
  default: vi.fn().mockImplementation(() => ({
    get: ioGet,
    set: ioSet,
    del: ioDel,
    lpush: ioLpush,
    lrange: ioLrange,
  })),
}));

import {
  deleteSession,
  getFeedback,
  getSession,
  pushFeedback,
  saveSession,
} from "@/lib/session-store";
import type { SessionState } from "@/types/session";

function makeSession(overrides: Partial<SessionState> = {}): SessionState {
  return {
    sessionId: "TEST01",
    hostToken: "host-tok",
    players: [],
    started: false,
    gameState: null,
    currentPlayerId: null,
    pendingAction: null,
    diceResult: null,
    lastMoveInfo: null,
    gameOver: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  };
}

const SESSION_TTL = 60 * 60 * 4;

const ENV_KEYS = ["KV_REST_API_URL", "KV_REST_API_TOKEN", "REDIS_URL"] as const;
const savedEnv: Record<string, string | undefined> = {};

beforeEach(() => {
  for (const key of ENV_KEYS) savedEnv[key] = process.env[key];
});

afterEach(() => {
  vi.clearAllMocks();
  for (const key of ENV_KEYS) {
    if (savedEnv[key] === undefined) delete process.env[key];
    else process.env[key] = savedEnv[key];
  }
});

describe("session-store (Upstash Redis via KV_REST_API_URL)", () => {
  beforeEach(() => {
    process.env.KV_REST_API_URL = "https://example.upstash.io";
    process.env.KV_REST_API_TOKEN = "tok";
    delete process.env.REDIS_URL;
  });

  test("getSession calls Redis.get with the namespaced key", async () => {
    kvGet.mockResolvedValue(null);
    const result = await getSession("abc");
    expect(kvGet).toHaveBeenCalledWith("session:abc");
    expect(result).toBeNull();
  });

  test("saveSession calls Redis.set with the TTL option", async () => {
    kvSet.mockResolvedValue("OK");
    const session = makeSession({ sessionId: "abc" });

    await saveSession("abc", session);

    expect(kvSet).toHaveBeenCalledWith(
      "session:abc",
      expect.objectContaining({ sessionId: "abc" }),
      { ex: SESSION_TTL },
    );
  });

  test("deleteSession calls Redis.del with the namespaced key", async () => {
    kvDel.mockResolvedValue(1);
    await deleteSession("abc");
    expect(kvDel).toHaveBeenCalledWith("session:abc");
  });

  test("pushFeedback calls Redis.lpush on the feedback list", async () => {
    kvLpush.mockResolvedValue(1);
    await pushFeedback("hello");
    expect(kvLpush).toHaveBeenCalledWith("feedback:list", "hello");
  });

  test("getFeedback calls Redis.lrange with the requested count", async () => {
    kvLrange.mockResolvedValue(["a", "b"]);
    const result = await getFeedback(5);
    expect(kvLrange).toHaveBeenCalledWith("feedback:list", 0, 4);
    expect(result).toEqual(["a", "b"]);
  });
});

describe("session-store (local ioredis via REDIS_URL)", () => {
  beforeEach(() => {
    delete process.env.KV_REST_API_URL;
    delete process.env.KV_REST_API_TOKEN;
    process.env.REDIS_URL = "redis://localhost:6379";
  });

  test("getSession parses the JSON payload returned by ioredis", async () => {
    ioGet.mockResolvedValue(JSON.stringify(makeSession({ sessionId: "xyz" })));
    const result = await getSession("xyz");
    expect(ioGet).toHaveBeenCalledWith("session:xyz");
    expect(result?.sessionId).toBe("xyz");
  });

  test("getSession returns null when ioredis has no value", async () => {
    ioGet.mockResolvedValue(null);
    const result = await getSession("missing");
    expect(result).toBeNull();
  });

  test("getSession returns null when the stored value is invalid JSON", async () => {
    ioGet.mockResolvedValue("not-json{{{");
    const result = await getSession("broken");
    expect(result).toBeNull();
  });

  test("saveSession calls ioredis set with a stringified value and EX ttl", async () => {
    ioSet.mockResolvedValue("OK");
    const session = makeSession({ sessionId: "xyz" });

    await saveSession("xyz", session);

    expect(ioSet).toHaveBeenCalledWith(
      "session:xyz",
      expect.any(String),
      "EX",
      SESSION_TTL,
    );
    const stored = JSON.parse(ioSet.mock.calls[0][1] as string);
    expect(stored.sessionId).toBe("xyz");
  });

  test("deleteSession calls ioredis del with the namespaced key", async () => {
    ioDel.mockResolvedValue(1);
    await deleteSession("xyz");
    expect(ioDel).toHaveBeenCalledWith("session:xyz");
  });

  test("pushFeedback calls ioredis lpush on the feedback list", async () => {
    ioLpush.mockResolvedValue(1);
    await pushFeedback("hi");
    expect(ioLpush).toHaveBeenCalledWith("feedback:list", "hi");
  });

  test("getFeedback calls ioredis lrange with the default count", async () => {
    ioLrange.mockResolvedValue(["x"]);
    const result = await getFeedback();
    expect(ioLrange).toHaveBeenCalledWith("feedback:list", 0, 99);
    expect(result).toEqual(["x"]);
  });
});
