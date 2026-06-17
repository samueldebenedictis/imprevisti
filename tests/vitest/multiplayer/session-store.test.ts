import { describe, expect, test } from "vitest";
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

describe("session-store (in-memory fallback)", () => {
  test("getSession returns null for unknown id", async () => {
    const result = await getSession("session-store-test-unknown-xyz");
    expect(result).toBeNull();
  });

  test("saveSession and getSession round-trip", async () => {
    const id = "session-store-test-1";
    const session = makeSession({ sessionId: id, hostToken: "tok-1" });

    await saveSession(id, session);
    const retrieved = await getSession(id);

    expect(retrieved).not.toBeNull();
    expect(retrieved?.sessionId).toBe(id);
    expect(retrieved?.hostToken).toBe("tok-1");
  });

  test("saveSession sets updatedAt to current time", async () => {
    const id = "session-store-test-2";
    const before = Date.now();
    const session = makeSession({ sessionId: id, updatedAt: 0 });

    await saveSession(id, session);
    const after = Date.now();

    const retrieved = await getSession(id);
    expect(retrieved?.updatedAt).toBeGreaterThanOrEqual(before);
    expect(retrieved?.updatedAt).toBeLessThanOrEqual(after);
  });

  test("saveSession overwrites existing session", async () => {
    const id = "session-store-test-3";
    const session1 = makeSession({ sessionId: id, hostToken: "first-tok" });
    await saveSession(id, session1);

    const session2 = makeSession({
      sessionId: id,
      hostToken: "second-tok",
      players: [{ id: "0", name: "Alice" }],
    });
    await saveSession(id, session2);

    const retrieved = await getSession(id);
    expect(retrieved?.hostToken).toBe("second-tok");
    expect(retrieved?.players).toHaveLength(1);
    expect(retrieved?.players[0].name).toBe("Alice");
  });

  test("deleteSession removes the session", async () => {
    const id = "session-store-test-4";
    const session = makeSession({ sessionId: id });

    await saveSession(id, session);
    expect(await getSession(id)).not.toBeNull();

    await deleteSession(id);
    expect(await getSession(id)).toBeNull();
  });

  test("deleteSession on non-existent id does not throw", async () => {
    await expect(
      deleteSession("session-store-test-nonexistent"),
    ).resolves.not.toThrow();
  });

  test("sessions with different IDs do not interfere", async () => {
    const idA = "session-store-test-5a";
    const idB = "session-store-test-5b";

    await saveSession(idA, makeSession({ sessionId: idA, hostToken: "tok-A" }));
    await saveSession(idB, makeSession({ sessionId: idB, hostToken: "tok-B" }));

    const a = await getSession(idA);
    const b = await getSession(idB);

    expect(a?.hostToken).toBe("tok-A");
    expect(b?.hostToken).toBe("tok-B");
  });

  test("pushFeedback does not throw in in-memory mode", async () => {
    await expect(pushFeedback("test feedback entry")).resolves.not.toThrow();
  });

  test("getFeedback returns empty array in in-memory mode", async () => {
    const result = await getFeedback();
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(0);
  });

  test("saveSession preserves all fields except updatedAt", async () => {
    const id = "session-store-test-6";
    const session = makeSession({
      sessionId: id,
      hostToken: "preserve-tok",
      players: [{ id: "0", name: "Bob" }],
      started: true,
      currentPlayerId: "0",
      pendingAction: {
        type: "quiz",
        card: { cardTitle: "Q?", cardText: "Q?" },
        actorPlayerId: "0",
      },
      diceResult: 4,
      lastMoveInfo: {
        actorPlayerId: "0",
        diceResult: 4,
        squareNumber: 4,
        squareType: "quiz",
      },
      gameOver: null,
    });

    await saveSession(id, session);
    const retrieved = await getSession(id);

    expect(retrieved?.players[0].name).toBe("Bob");
    expect(retrieved?.started).toBe(true);
    expect(retrieved?.currentPlayerId).toBe("0");
    expect(retrieved?.diceResult).toBe(4);
    expect(retrieved?.pendingAction?.type).toBe("quiz");
    expect(retrieved?.lastMoveInfo?.squareType).toBe("quiz");
  });
});
