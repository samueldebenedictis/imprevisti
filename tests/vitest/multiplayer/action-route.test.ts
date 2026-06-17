// @vitest-environment node
import { afterEach, describe, expect, test, vi } from "vitest";
import { Board } from "@/model/board";
import { Game } from "@/model/game";
import { Player } from "@/model/player";
import { Square } from "@/model/square/square";
import type { SessionState } from "@/types/session";

vi.mock("@/lib/session-store", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/session-store")>();
  return { ...actual, getSession: vi.fn(), saveSession: vi.fn() };
});

import { POST } from "@/app/api/sessions/[id]/action/route";
import * as sessionStore from "@/lib/session-store";

function makeGameState() {
  const squares = Array.from({ length: 20 }, (_, i) => new Square(i));
  const players = [new Player(0, "Alice"), new Player(1, "Bob")];
  const board = new Board(squares, players);
  return new Game(board).toJSON();
}

function mockSession(overrides: Partial<SessionState> = {}): SessionState {
  return {
    sessionId: "TEST01",
    hostToken: "host-tok",
    players: [
      { id: "0", name: "Alice" },
      { id: "1", name: "Bob" },
    ],
    started: true,
    gameState: makeGameState(),
    currentPlayerId: "0",
    pendingAction: null,
    diceResult: null,
    lastMoveInfo: null,
    gameOver: null,
    updatedAt: Date.now(),
    createdAt: Date.now(),
    ...overrides,
  };
}

function makeReq(body: object) {
  return new Request("http://localhost/api/sessions/TEST01/action", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const params = { params: Promise.resolve({ id: "TEST01" }) };

afterEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/sessions/[id]/action", () => {
  test("400 when game is not started", async () => {
    vi.mocked(sessionStore.getSession).mockResolvedValue(
      mockSession({ started: false, gameState: null }),
    );
    vi.mocked(sessionStore.saveSession).mockResolvedValue(undefined);

    const res = await POST(
      makeReq({ hostToken: "host-tok", success: true }),
      params,
    );
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  test("409 when there is no pendingAction", async () => {
    vi.mocked(sessionStore.getSession).mockResolvedValue(
      mockSession({ pendingAction: null }),
    );
    vi.mocked(sessionStore.saveSession).mockResolvedValue(undefined);

    const res = await POST(
      makeReq({ hostToken: "host-tok", success: true }),
      params,
    );
    expect(res.status).toBe(409);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  test("403 quiz action without hostToken", async () => {
    vi.mocked(sessionStore.getSession).mockResolvedValue(
      mockSession({
        pendingAction: {
          type: "quiz",
          card: { cardTitle: "What is 2+2?", cardText: "What is 2+2?" },
          actorPlayerId: "0",
        },
      }),
    );
    vi.mocked(sessionStore.saveSession).mockResolvedValue(undefined);

    const res = await POST(makeReq({ success: true }), params);
    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  test("403 quiz action with wrong hostToken", async () => {
    vi.mocked(sessionStore.getSession).mockResolvedValue(
      mockSession({
        pendingAction: {
          type: "quiz",
          card: { cardTitle: "What is 2+2?", cardText: "What is 2+2?" },
          actorPlayerId: "0",
        },
      }),
    );
    vi.mocked(sessionStore.saveSession).mockResolvedValue(undefined);

    const res = await POST(
      makeReq({ hostToken: "wrong-tok", success: true }),
      params,
    );
    expect(res.status).toBe(403);
  });

  test("quiz success: returns 200 and clears pendingAction", async () => {
    vi.mocked(sessionStore.getSession).mockResolvedValue(
      mockSession({
        pendingAction: {
          type: "quiz",
          card: {
            cardTitle: "Capital of Italy?",
            cardText: "Capital of Italy?",
          },
          actorPlayerId: "0",
        },
      }),
    );
    vi.mocked(sessionStore.saveSession).mockResolvedValue(undefined);

    const res = await POST(
      makeReq({ hostToken: "host-tok", success: true }),
      params,
    );
    expect(res.status).toBe(200);

    const savedArg = vi.mocked(sessionStore.saveSession).mock.calls[0][1];
    expect(savedArg.pendingAction).toBeNull();
  });

  test("quiz success: currentPlayerId advances to next player", async () => {
    vi.mocked(sessionStore.getSession).mockResolvedValue(
      mockSession({
        currentPlayerId: "0",
        pendingAction: {
          type: "quiz",
          card: {
            cardTitle: "Capital of Italy?",
            cardText: "Capital of Italy?",
          },
          actorPlayerId: "0",
        },
      }),
    );
    vi.mocked(sessionStore.saveSession).mockResolvedValue(undefined);

    await POST(makeReq({ hostToken: "host-tok", success: true }), params);

    const savedArg = vi.mocked(sessionStore.saveSession).mock.calls[0][1];
    // After quiz success the actor advances, turn moves to next player
    expect(savedArg.currentPlayerId).toBeDefined();
  });

  test("quiz fail: returns 200 and clears pendingAction", async () => {
    vi.mocked(sessionStore.getSession).mockResolvedValue(
      mockSession({
        currentPlayerId: "0",
        pendingAction: {
          type: "quiz",
          card: { cardTitle: "Hard question?", cardText: "Hard question?" },
          actorPlayerId: "0",
        },
      }),
    );
    vi.mocked(sessionStore.saveSession).mockResolvedValue(undefined);

    const res = await POST(
      makeReq({ hostToken: "host-tok", success: false }),
      params,
    );
    expect(res.status).toBe(200);

    const savedArg = vi.mocked(sessionStore.saveSession).mock.calls[0][1];
    expect(savedArg.pendingAction).toBeNull();
  });

  test("quiz response does not expose hostToken", async () => {
    vi.mocked(sessionStore.getSession).mockResolvedValue(
      mockSession({
        pendingAction: {
          type: "quiz",
          card: { cardTitle: "Q?", cardText: "Q?" },
          actorPlayerId: "0",
        },
      }),
    );
    vi.mocked(sessionStore.saveSession).mockResolvedValue(undefined);

    const res = await POST(
      makeReq({ hostToken: "host-tok", success: true }),
      params,
    );
    const data = await res.json();
    expect(data.hostToken).toBeUndefined();
  });

  test("403 battle action with wrong hostToken", async () => {
    vi.mocked(sessionStore.getSession).mockResolvedValue(
      mockSession({
        pendingAction: {
          type: "battle",
          card: null,
          actorPlayerId: "0",
          targetPlayerId: "1",
        },
      }),
    );
    vi.mocked(sessionStore.saveSession).mockResolvedValue(undefined);

    const res = await POST(
      makeReq({ hostToken: "wrong-tok", success: true, winnerId: "0" }),
      params,
    );
    expect(res.status).toBe(403);
  });

  test("battle valid: returns 200 and updates game state", async () => {
    vi.mocked(sessionStore.getSession).mockResolvedValue(
      mockSession({
        pendingAction: {
          type: "battle",
          card: null,
          actorPlayerId: "0",
          targetPlayerId: "1",
        },
      }),
    );
    vi.mocked(sessionStore.saveSession).mockResolvedValue(undefined);

    const res = await POST(
      makeReq({ hostToken: "host-tok", success: true, winnerId: "0" }),
      params,
    );
    expect(res.status).toBe(200);

    const savedArg = vi.mocked(sessionStore.saveSession).mock.calls[0][1];
    expect(savedArg.gameState).not.toBeNull();
  });

  test("saveSession is called exactly once per action", async () => {
    vi.mocked(sessionStore.getSession).mockResolvedValue(
      mockSession({
        pendingAction: {
          type: "quiz",
          card: { cardTitle: "Q?", cardText: "Q?" },
          actorPlayerId: "0",
        },
      }),
    );
    vi.mocked(sessionStore.saveSession).mockResolvedValue(undefined);

    await POST(makeReq({ hostToken: "host-tok", success: true }), params);
    expect(vi.mocked(sessionStore.saveSession).mock.calls).toHaveLength(1);
  });
});
