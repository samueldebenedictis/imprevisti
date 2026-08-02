// @vitest-environment node
import { afterEach, describe, expect, test, vi } from "vitest";

vi.mock("@/lib/session-store", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/session-store")>();
  return { ...actual, getSession: vi.fn(), saveSession: vi.fn() };
});

vi.mock("@/model/dice", () => {
  const rollMock = vi.fn(() => 1);
  const DiceMock = vi.fn().mockImplementation(function (
    this: { faces: number; roll: () => number },
    faces: number,
  ) {
    this.faces = faces;
    this.roll = rollMock;
  });
  return { Dice: DiceMock, __esModule: true };
});

import { POST as rollPOST } from "@/app/api/sessions/[id]/roll/route";
import * as sessionStore from "@/lib/session-store";
import { Board } from "@/model/board";
import { Game } from "@/model/game";
import { Player } from "@/model/player";
import { DictationDrawSquare, MimeSquare, Square } from "@/model/square";
import type { SessionState } from "@/types/session";

function makeSquares(size: number) {
  return Array.from({ length: size }, (_, i) => new Square(i));
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
    gameState: null,
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

function rollRequest(playerId = "0") {
  return new Request("http://localhost/api/sessions/TEST01/roll", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ playerId }),
  });
}

const params = { params: Promise.resolve({ id: "TEST01" }) };

afterEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/sessions/[id]/roll — branch coverage", () => {
  test("game end: sets gameOver and clears currentPlayerId", async () => {
    // Board with 2 squares: any roll (mocked to 1) wins immediately.
    const board = new Board(makeSquares(2), [
      new Player(0, "Alice"),
      new Player(1, "Bob"),
    ]);
    const gameState = new Game(board).toJSON();

    vi.mocked(sessionStore.getSession).mockResolvedValue(
      mockSession({ gameState }),
    );
    vi.mocked(sessionStore.saveSession).mockResolvedValue(undefined);

    const res = await rollPOST(rollRequest("0"), params);
    expect(res.status).toBe(200);

    const saved = vi.mocked(sessionStore.saveSession).mock.calls[0][1];
    expect(saved.gameOver).toStrictEqual({ winnerName: "Alice" });
    expect(saved.currentPlayerId).toBeNull();
    expect(saved.pendingAction).toBeNull();
  });

  test("battle: sets pendingAction of type battle without ending the game", async () => {
    // Board of 4 squares (win threshold at position 3): Bob is pre-positioned
    // on square 1, so Alice's mocked roll of 1 collides with him there.
    const alice = new Player(0, "Alice");
    const bob = new Player(1, "Bob");
    const board = new Board(makeSquares(4), [alice, bob]);
    board.movePlayer(bob, 1);
    const gameState = new Game(board).toJSON();

    vi.mocked(sessionStore.getSession).mockResolvedValue(
      mockSession({ gameState }),
    );
    vi.mocked(sessionStore.saveSession).mockResolvedValue(undefined);

    const res = await rollPOST(rollRequest("0"), params);
    expect(res.status).toBe(200);

    const saved = vi.mocked(sessionStore.saveSession).mock.calls[0][1];
    expect(saved.pendingAction).toStrictEqual({
      type: "battle",
      card: null,
      actorPlayerId: "0",
      targetPlayerId: "1",
    });
    expect(saved.gameOver).toBeNull();
  });

  test("special action (mime): pendingAction has no targetPlayerId", async () => {
    const squares = makeSquares(4);
    squares[1] = new MimeSquare(1);
    const board = new Board(squares, [
      new Player(0, "Alice"),
      new Player(1, "Bob"),
    ]);
    const gameState = new Game(board).toJSON();

    vi.mocked(sessionStore.getSession).mockResolvedValue(
      mockSession({ gameState }),
    );
    vi.mocked(sessionStore.saveSession).mockResolvedValue(undefined);

    const res = await rollPOST(rollRequest("0"), params);
    expect(res.status).toBe(200);

    const saved = vi.mocked(sessionStore.saveSession).mock.calls[0][1];
    expect(saved.pendingAction?.type).toBe("mime");
    expect(saved.pendingAction?.actorPlayerId).toBe("0");
    expect(saved.pendingAction?.targetPlayerId).toBeUndefined();
    expect(saved.pendingAction?.card).toBeDefined();
  });

  test("special action (dictation-draw): pendingAction pre-selects the next player as target and keeps the imageUrl", async () => {
    const squares = makeSquares(4);
    squares[1] = new DictationDrawSquare(1);
    const board = new Board(squares, [
      new Player(0, "Alice"),
      new Player(1, "Bob"),
    ]);
    const gameState = new Game(board).toJSON();

    vi.mocked(sessionStore.getSession).mockResolvedValue(
      mockSession({ gameState }),
    );
    vi.mocked(sessionStore.saveSession).mockResolvedValue(undefined);

    const res = await rollPOST(rollRequest("0"), params);
    expect(res.status).toBe(200);

    const saved = vi.mocked(sessionStore.saveSession).mock.calls[0][1];
    expect(saved.pendingAction?.type).toBe("dictation-draw");
    expect(saved.pendingAction?.targetPlayerId).toBe("1");
    expect(saved.pendingAction?.card).toHaveProperty("imageUrl");
  });

  test("no crash and lastMoveInfo stays null when currentPlayerId does not match any player in gameState", async () => {
    const board = new Board(makeSquares(10), [
      new Player(0, "Alice"),
      new Player(1, "Bob"),
    ]);
    const gameState = new Game(board).toJSON();

    // Corrupted/inconsistent session state: currentPlayerId points at a
    // player id that no longer exists in gameState.
    vi.mocked(sessionStore.getSession).mockResolvedValue(
      mockSession({ gameState, currentPlayerId: "99" }),
    );
    vi.mocked(sessionStore.saveSession).mockResolvedValue(undefined);

    const res = await rollPOST(rollRequest("99"), params);
    expect(res.status).toBe(200);

    const saved = vi.mocked(sessionStore.saveSession).mock.calls[0][1];
    expect(saved.lastMoveInfo).toBeNull();
  });
});
