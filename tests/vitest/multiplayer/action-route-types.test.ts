// @vitest-environment node
import { afterEach, describe, expect, test, vi } from "vitest";

vi.mock("@/lib/session-store", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/session-store")>();
  return { ...actual, getSession: vi.fn(), saveSession: vi.fn() };
});

import { POST } from "@/app/api/sessions/[id]/action/route";
import * as sessionStore from "@/lib/session-store";
import { Board } from "@/model/board";
import { Game } from "@/model/game";
import { Player } from "@/model/player";
import { Square } from "@/model/square/square";
import type { PendingAction, SessionState } from "@/types/session";

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

describe("POST /api/sessions/[id]/action — remaining action types", () => {
  test("mime success: resolves via the chosen winner and clears pendingAction", async () => {
    const pendingAction: PendingAction = {
      type: "mime",
      card: { cardTitle: "Gatto", cardText: "Gatto" },
      actorPlayerId: "0",
      targetPlayerId: "1",
    };
    vi.mocked(sessionStore.getSession).mockResolvedValue(
      mockSession({ pendingAction }),
    );
    vi.mocked(sessionStore.saveSession).mockResolvedValue(undefined);

    const res = await POST(
      makeReq({ hostToken: "host-tok", success: true, winnerId: "1" }),
      params,
    );
    expect(res.status).toBe(200);

    const saved = vi.mocked(sessionStore.saveSession).mock.calls[0][1];
    expect(saved.pendingAction).toBeNull();
    expect(saved.gameState).not.toBeNull();
  });

  test("backwrite success: resolves and clears pendingAction", async () => {
    const pendingAction: PendingAction = {
      type: "backwrite",
      card: { cardTitle: "Casa", cardText: "Casa" },
      actorPlayerId: "0",
      targetPlayerId: "1",
    };
    vi.mocked(sessionStore.getSession).mockResolvedValue(
      mockSession({ pendingAction }),
    );
    vi.mocked(sessionStore.saveSession).mockResolvedValue(undefined);

    const res = await POST(
      makeReq({ hostToken: "host-tok", success: true, winnerId: "1" }),
      params,
    );
    expect(res.status).toBe(200);

    const saved = vi.mocked(sessionStore.saveSession).mock.calls[0][1];
    expect(saved.pendingAction).toBeNull();
  });

  test("face-emotion success: reads the { topic, imageUrl } card shape", async () => {
    const pendingAction: PendingAction = {
      type: "face-emotion",
      card: {
        topic: { cardTitle: "Felice", cardText: "Happy" },
        imageUrl: "/images/face-emotion/happy.svg",
      },
      actorPlayerId: "0",
    };
    vi.mocked(sessionStore.getSession).mockResolvedValue(
      mockSession({ pendingAction }),
    );
    vi.mocked(sessionStore.saveSession).mockResolvedValue(undefined);

    const res = await POST(
      makeReq({ hostToken: "host-tok", success: true }),
      params,
    );
    expect(res.status).toBe(200);

    const saved = vi.mocked(sessionStore.saveSession).mock.calls[0][1];
    expect(saved.pendingAction).toBeNull();
  });

  test("music-emotion success: resolves and advances the turn", async () => {
    const pendingAction: PendingAction = {
      type: "music-emotion",
      card: { cardTitle: "Gioia", cardText: "Gioia" },
      actorPlayerId: "0",
    };
    vi.mocked(sessionStore.getSession).mockResolvedValue(
      mockSession({ pendingAction }),
    );
    vi.mocked(sessionStore.saveSession).mockResolvedValue(undefined);

    const res = await POST(
      makeReq({ hostToken: "host-tok", success: true }),
      params,
    );
    expect(res.status).toBe(200);

    const saved = vi.mocked(sessionStore.saveSession).mock.calls[0][1];
    expect(saved.pendingAction).toBeNull();
    expect(saved.currentPlayerId).toBeDefined();
  });

  test("physical-test failure: resolves without advancing via a winner", async () => {
    const pendingAction: PendingAction = {
      type: "physical-test",
      card: { cardTitle: "Salta", cardText: "Salta" },
      actorPlayerId: "0",
    };
    vi.mocked(sessionStore.getSession).mockResolvedValue(
      mockSession({ pendingAction }),
    );
    vi.mocked(sessionStore.saveSession).mockResolvedValue(undefined);

    const res = await POST(
      makeReq({ hostToken: "host-tok", success: false }),
      params,
    );
    expect(res.status).toBe(200);

    const saved = vi.mocked(sessionStore.saveSession).mock.calls[0][1];
    expect(saved.pendingAction).toBeNull();
  });

  test("what-would-you-do success: resolves and clears pendingAction", async () => {
    const pendingAction: PendingAction = {
      type: "what-would-you-do",
      card: { cardTitle: "Domanda", cardText: "Domanda" },
      actorPlayerId: "0",
    };
    vi.mocked(sessionStore.getSession).mockResolvedValue(
      mockSession({ pendingAction }),
    );
    vi.mocked(sessionStore.saveSession).mockResolvedValue(undefined);

    const res = await POST(
      makeReq({ hostToken: "host-tok", success: true }),
      params,
    );
    expect(res.status).toBe(200);

    const saved = vi.mocked(sessionStore.saveSession).mock.calls[0][1];
    expect(saved.pendingAction).toBeNull();
  });

  test("dictation-draw success: reads the { topic, imageUrl } card shape and resolves via winner", async () => {
    const pendingAction: PendingAction = {
      type: "dictation-draw",
      card: {
        topic: { cardTitle: "Sole", cardText: "Sole" },
        imageUrl: "/images/dictation-draw/sun.svg",
      },
      actorPlayerId: "0",
      targetPlayerId: "1",
    };
    vi.mocked(sessionStore.getSession).mockResolvedValue(
      mockSession({ pendingAction }),
    );
    vi.mocked(sessionStore.saveSession).mockResolvedValue(undefined);

    const res = await POST(
      makeReq({ hostToken: "host-tok", success: true, winnerId: "1" }),
      params,
    );
    expect(res.status).toBe(200);

    const saved = vi.mocked(sessionStore.saveSession).mock.calls[0][1];
    expect(saved.pendingAction).toBeNull();
  });

  test("400 when the battle target players cannot be found in gameState", async () => {
    const pendingAction: PendingAction = {
      type: "battle",
      card: null,
      actorPlayerId: "0",
      targetPlayerId: "99",
    };
    vi.mocked(sessionStore.getSession).mockResolvedValue(
      mockSession({ pendingAction }),
    );
    vi.mocked(sessionStore.saveSession).mockResolvedValue(undefined);

    const res = await POST(
      makeReq({ hostToken: "host-tok", success: true, winnerId: "0" }),
      params,
    );
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  test("400 when the battle winnerId does not match a player", async () => {
    const pendingAction: PendingAction = {
      type: "battle",
      card: null,
      actorPlayerId: "0",
      targetPlayerId: "1",
    };
    vi.mocked(sessionStore.getSession).mockResolvedValue(
      mockSession({ pendingAction }),
    );
    vi.mocked(sessionStore.saveSession).mockResolvedValue(undefined);

    const res = await POST(
      makeReq({ hostToken: "host-tok", success: true, winnerId: "99" }),
      params,
    );
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  test("battle: game end sets gameOver and clears currentPlayerId", async () => {
    // 2-square board: the winner's forward move always reaches the win threshold.
    const squares = Array.from({ length: 2 }, (_, i) => new Square(i));
    const alice = new Player(0, "Alice");
    const bob = new Player(1, "Bob");
    const board = new Board(squares, [alice, bob]);
    const gameState = new Game(board).toJSON();

    const pendingAction: PendingAction = {
      type: "battle",
      card: null,
      actorPlayerId: "0",
      targetPlayerId: "1",
    };
    vi.mocked(sessionStore.getSession).mockResolvedValue(
      mockSession({ gameState, pendingAction }),
    );
    vi.mocked(sessionStore.saveSession).mockResolvedValue(undefined);

    const res = await POST(
      makeReq({ hostToken: "host-tok", success: true, winnerId: "0" }),
      params,
    );
    expect(res.status).toBe(200);

    const saved = vi.mocked(sessionStore.saveSession).mock.calls[0][1];
    expect(saved.gameOver).toStrictEqual({ winnerName: "Alice" });
    expect(saved.currentPlayerId).toBeNull();
    expect(saved.pendingAction).toBeNull();
  });

  test("battle: winner colliding again keeps a battle pendingAction", async () => {
    // 3 players on a board large enough to avoid the win threshold: Alice
    // beats Bob on square 1, then her forward move (+1) collides with Carl
    // who is pre-positioned on square 2.
    const squares = Array.from({ length: 10 }, (_, i) => new Square(i));
    const alice = new Player(0, "Alice");
    const bob = new Player(1, "Bob");
    const carl = new Player(2, "Carl");
    const board = new Board(squares, [alice, bob, carl]);
    board.movePlayer(alice, 1);
    board.movePlayer(bob, 1);
    board.movePlayer(carl, 2);
    const gameState = new Game(board).toJSON();

    const pendingAction: PendingAction = {
      type: "battle",
      card: null,
      actorPlayerId: "0",
      targetPlayerId: "1",
    };
    vi.mocked(sessionStore.getSession).mockResolvedValue(
      mockSession({
        gameState,
        pendingAction,
        players: [
          { id: "0", name: "Alice" },
          { id: "1", name: "Bob" },
          { id: "2", name: "Carl" },
        ],
      }),
    );
    vi.mocked(sessionStore.saveSession).mockResolvedValue(undefined);

    const res = await POST(
      makeReq({ hostToken: "host-tok", success: true, winnerId: "0" }),
      params,
    );
    expect(res.status).toBe(200);

    const saved = vi.mocked(sessionStore.saveSession).mock.calls[0][1];
    expect(saved.pendingAction).toStrictEqual({
      type: "battle",
      card: null,
      actorPlayerId: "0",
      targetPlayerId: "2",
    });
    expect(saved.gameOver).toBeNull();
  });
});
