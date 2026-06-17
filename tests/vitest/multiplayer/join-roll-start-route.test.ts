// @vitest-environment node
import { afterEach, describe, expect, test, vi } from "vitest";
import { Board } from "@/model/board";
import { Game } from "@/model/game";
import { Player } from "@/model/player";
import { Square } from "@/model/square/square";
import type { GameConfig } from "@/store/config-store";
import type { SessionState } from "@/types/session";

vi.mock("@/lib/session-store", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/session-store")>();
  return { ...actual, getSession: vi.fn(), saveSession: vi.fn() };
});

import { POST as joinPOST } from "@/app/api/sessions/[id]/join/route";
import { POST as rollPOST } from "@/app/api/sessions/[id]/roll/route";
import { POST as selectTargetPOST } from "@/app/api/sessions/[id]/select-target/route";
import { POST as startPOST } from "@/app/api/sessions/[id]/start/route";
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
    started: false,
    gameState: null,
    currentPlayerId: null,
    pendingAction: null,
    diceResult: null,
    lastMoveInfo: null,
    gameOver: null,
    updatedAt: Date.now(),
    createdAt: Date.now(),
    ...overrides,
  };
}

const defaultBoardConfig: GameConfig = {
  numPlayers: 2,
  playerNames: ["Alice", "Bob"],
  numSquares: 20,
  squareTypes: {
    mime: false,
    quiz: true,
    move: false,
    backwrite: false,
    "face-emotion": false,
    "music-emotion": false,
    "physical-test": false,
    "what-would-you-do": false,
    "dictation-draw": false,
  },
  specialPercentage: 20,
  customSquares: null,
};

afterEach(() => {
  vi.clearAllMocks();
});

// ─── JOIN ────────────────────────────────────────────────────────────────────

describe("POST /api/sessions/[id]/join", () => {
  test("success: returns playerId '0' for first player", async () => {
    vi.mocked(sessionStore.getSession).mockResolvedValue(
      mockSession({ started: false, players: [] }),
    );
    vi.mocked(sessionStore.saveSession).mockResolvedValue(undefined);

    const res = await joinPOST(
      new Request("http://localhost/api/sessions/TEST01/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerName: "Carlo" }),
      }),
      { params: Promise.resolve({ id: "TEST01" }) },
    );

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.playerId).toBe("0");
  });

  test("success: playerId increments with existing players", async () => {
    vi.mocked(sessionStore.getSession).mockResolvedValue(
      mockSession({
        started: false,
        players: [{ id: "0", name: "Alice" }],
      }),
    );
    vi.mocked(sessionStore.saveSession).mockResolvedValue(undefined);

    const res = await joinPOST(
      new Request("http://localhost/api/sessions/TEST01/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerName: "Bob" }),
      }),
      { params: Promise.resolve({ id: "TEST01" }) },
    );

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.playerId).toBe("1");
  });

  test("409 when game is already started", async () => {
    vi.mocked(sessionStore.getSession).mockResolvedValue(
      mockSession({ started: true }),
    );
    vi.mocked(sessionStore.saveSession).mockResolvedValue(undefined);

    const res = await joinPOST(
      new Request("http://localhost/api/sessions/TEST01/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerName: "Carlo" }),
      }),
      { params: Promise.resolve({ id: "TEST01" }) },
    );

    expect(res.status).toBe(409);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  test("400 when playerName is empty", async () => {
    vi.mocked(sessionStore.getSession).mockResolvedValue(
      mockSession({ started: false, players: [] }),
    );
    vi.mocked(sessionStore.saveSession).mockResolvedValue(undefined);

    const res = await joinPOST(
      new Request("http://localhost/api/sessions/TEST01/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerName: "" }),
      }),
      { params: Promise.resolve({ id: "TEST01" }) },
    );

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  test("400 when playerName is whitespace only", async () => {
    vi.mocked(sessionStore.getSession).mockResolvedValue(
      mockSession({ started: false, players: [] }),
    );
    vi.mocked(sessionStore.saveSession).mockResolvedValue(undefined);

    const res = await joinPOST(
      new Request("http://localhost/api/sessions/TEST01/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerName: "   " }),
      }),
      { params: Promise.resolve({ id: "TEST01" }) },
    );

    expect(res.status).toBe(400);
  });

  test("404 when session does not exist", async () => {
    vi.mocked(sessionStore.getSession).mockResolvedValue(null);
    vi.mocked(sessionStore.saveSession).mockResolvedValue(undefined);

    const res = await joinPOST(
      new Request("http://localhost/api/sessions/NOTFOUND/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerName: "Alice" }),
      }),
      { params: Promise.resolve({ id: "NOTFOUND" }) },
    );

    expect(res.status).toBe(404);
  });

  test("saveSession is called with the new player appended", async () => {
    vi.mocked(sessionStore.getSession).mockResolvedValue(
      mockSession({ started: false, players: [] }),
    );
    vi.mocked(sessionStore.saveSession).mockResolvedValue(undefined);

    await joinPOST(
      new Request("http://localhost/api/sessions/TEST01/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerName: "Carlo" }),
      }),
      { params: Promise.resolve({ id: "TEST01" }) },
    );

    const saved = vi.mocked(sessionStore.saveSession).mock.calls[0][1];
    expect(saved.players).toHaveLength(1);
    expect(saved.players[0].name).toBe("Carlo");
    expect(saved.players[0].id).toBe("0");
  });
});

// ─── START ───────────────────────────────────────────────────────────────────

describe("POST /api/sessions/[id]/start", () => {
  test("403 with wrong hostToken", async () => {
    vi.mocked(sessionStore.getSession).mockResolvedValue(mockSession());
    vi.mocked(sessionStore.saveSession).mockResolvedValue(undefined);

    const res = await startPOST(
      new Request("http://localhost/api/sessions/TEST01/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hostToken: "wrong-tok",
          boardConfig: defaultBoardConfig,
        }),
      }),
      { params: Promise.resolve({ id: "TEST01" }) },
    );

    expect(res.status).toBe(403);
  });

  test("400 when fewer than 2 players", async () => {
    vi.mocked(sessionStore.getSession).mockResolvedValue(
      mockSession({ players: [{ id: "0", name: "Alice" }] }),
    );
    vi.mocked(sessionStore.saveSession).mockResolvedValue(undefined);

    const res = await startPOST(
      new Request("http://localhost/api/sessions/TEST01/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hostToken: "host-tok",
          boardConfig: defaultBoardConfig,
        }),
      }),
      { params: Promise.resolve({ id: "TEST01" }) },
    );

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  test("success: returns { ok: true }", async () => {
    vi.mocked(sessionStore.getSession).mockResolvedValue(
      mockSession({
        players: [
          { id: "0", name: "Alice" },
          { id: "1", name: "Bob" },
        ],
        started: false,
      }),
    );
    vi.mocked(sessionStore.saveSession).mockResolvedValue(undefined);

    const res = await startPOST(
      new Request("http://localhost/api/sessions/TEST01/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hostToken: "host-tok",
          boardConfig: defaultBoardConfig,
        }),
      }),
      { params: Promise.resolve({ id: "TEST01" }) },
    );

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
  });

  test("success: saveSession called with started=true", async () => {
    vi.mocked(sessionStore.getSession).mockResolvedValue(
      mockSession({
        players: [
          { id: "0", name: "Alice" },
          { id: "1", name: "Bob" },
        ],
        started: false,
      }),
    );
    vi.mocked(sessionStore.saveSession).mockResolvedValue(undefined);

    await startPOST(
      new Request("http://localhost/api/sessions/TEST01/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hostToken: "host-tok",
          boardConfig: defaultBoardConfig,
        }),
      }),
      { params: Promise.resolve({ id: "TEST01" }) },
    );

    const saved = vi.mocked(sessionStore.saveSession).mock.calls[0][1];
    expect(saved.started).toBe(true);
    expect(saved.gameState).not.toBeNull();
    expect(saved.currentPlayerId).toBe("0");
  });

  test("409 when already started", async () => {
    vi.mocked(sessionStore.getSession).mockResolvedValue(
      mockSession({ started: true }),
    );
    vi.mocked(sessionStore.saveSession).mockResolvedValue(undefined);

    const res = await startPOST(
      new Request("http://localhost/api/sessions/TEST01/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hostToken: "host-tok",
          boardConfig: defaultBoardConfig,
        }),
      }),
      { params: Promise.resolve({ id: "TEST01" }) },
    );

    expect(res.status).toBe(409);
  });

  test("404 when session not found", async () => {
    vi.mocked(sessionStore.getSession).mockResolvedValue(null);
    vi.mocked(sessionStore.saveSession).mockResolvedValue(undefined);

    const res = await startPOST(
      new Request("http://localhost/api/sessions/NOTFOUND/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hostToken: "host-tok",
          boardConfig: defaultBoardConfig,
        }),
      }),
      { params: Promise.resolve({ id: "NOTFOUND" }) },
    );

    expect(res.status).toBe(404);
  });
});

// ─── ROLL ────────────────────────────────────────────────────────────────────

describe("POST /api/sessions/[id]/roll", () => {
  test("400 when game is not started", async () => {
    vi.mocked(sessionStore.getSession).mockResolvedValue(
      mockSession({ started: false, gameState: null }),
    );
    vi.mocked(sessionStore.saveSession).mockResolvedValue(undefined);

    const res = await rollPOST(
      new Request("http://localhost/api/sessions/TEST01/roll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId: "0" }),
      }),
      { params: Promise.resolve({ id: "TEST01" }) },
    );

    expect(res.status).toBe(400);
  });

  test("403 when it is not the player's turn", async () => {
    vi.mocked(sessionStore.getSession).mockResolvedValue(
      mockSession({
        started: true,
        gameState: makeGameState(),
        currentPlayerId: "1",
      }),
    );
    vi.mocked(sessionStore.saveSession).mockResolvedValue(undefined);

    const res = await rollPOST(
      new Request("http://localhost/api/sessions/TEST01/roll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId: "0" }),
      }),
      { params: Promise.resolve({ id: "TEST01" }) },
    );

    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  test("409 when there is a pending action", async () => {
    vi.mocked(sessionStore.getSession).mockResolvedValue(
      mockSession({
        started: true,
        gameState: makeGameState(),
        currentPlayerId: "0",
        pendingAction: {
          type: "quiz",
          card: { cardTitle: "Q?", cardText: "Q?" },
          actorPlayerId: "0",
        },
      }),
    );
    vi.mocked(sessionStore.saveSession).mockResolvedValue(undefined);

    const res = await rollPOST(
      new Request("http://localhost/api/sessions/TEST01/roll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId: "0" }),
      }),
      { params: Promise.resolve({ id: "TEST01" }) },
    );

    expect(res.status).toBe(409);
  });

  test("success: returns diceResult as a number", async () => {
    vi.mocked(sessionStore.getSession).mockResolvedValue(
      mockSession({
        started: true,
        gameState: makeGameState(),
        currentPlayerId: "0",
        pendingAction: null,
      }),
    );
    vi.mocked(sessionStore.saveSession).mockResolvedValue(undefined);

    const res = await rollPOST(
      new Request("http://localhost/api/sessions/TEST01/roll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId: "0" }),
      }),
      { params: Promise.resolve({ id: "TEST01" }) },
    );

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(typeof data.diceResult).toBe("number");
    expect(data.diceResult).toBeGreaterThan(0);
  });

  test("success: lastMoveInfo is set", async () => {
    vi.mocked(sessionStore.getSession).mockResolvedValue(
      mockSession({
        started: true,
        gameState: makeGameState(),
        currentPlayerId: "0",
        pendingAction: null,
      }),
    );
    vi.mocked(sessionStore.saveSession).mockResolvedValue(undefined);

    const res = await rollPOST(
      new Request("http://localhost/api/sessions/TEST01/roll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId: "0" }),
      }),
      { params: Promise.resolve({ id: "TEST01" }) },
    );

    const data = await res.json();
    expect(data.lastMoveInfo).not.toBeNull();
    expect(data.lastMoveInfo.actorPlayerId).toBe("0");
  });

  test("success: hostToken is not exposed", async () => {
    vi.mocked(sessionStore.getSession).mockResolvedValue(
      mockSession({
        started: true,
        gameState: makeGameState(),
        currentPlayerId: "0",
        pendingAction: null,
      }),
    );
    vi.mocked(sessionStore.saveSession).mockResolvedValue(undefined);

    const res = await rollPOST(
      new Request("http://localhost/api/sessions/TEST01/roll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId: "0" }),
      }),
      { params: Promise.resolve({ id: "TEST01" }) },
    );

    const data = await res.json();
    expect(data.hostToken).toBeUndefined();
  });
});

// ─── SELECT-TARGET ───────────────────────────────────────────────────────────

describe("POST /api/sessions/[id]/select-target", () => {
  function makeSelectTargetReq(body: object) {
    return new Request("http://localhost/api/sessions/TEST01/select-target", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  test("409 when no pending action exists", async () => {
    vi.mocked(sessionStore.getSession).mockResolvedValue(
      mockSession({ pendingAction: null }),
    );
    vi.mocked(sessionStore.saveSession).mockResolvedValue(undefined);

    const res = await selectTargetPOST(
      makeSelectTargetReq({ playerId: "0", targetId: "1" }),
      { params: Promise.resolve({ id: "TEST01" }) },
    );

    expect(res.status).toBe(409);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  test("403 when player is not the actor", async () => {
    vi.mocked(sessionStore.getSession).mockResolvedValue(
      mockSession({
        pendingAction: {
          type: "mime",
          card: { cardTitle: "Cat", cardText: "Cat" },
          actorPlayerId: "0",
        },
      }),
    );
    vi.mocked(sessionStore.saveSession).mockResolvedValue(undefined);

    const res = await selectTargetPOST(
      makeSelectTargetReq({ playerId: "1", targetId: "0" }),
      { params: Promise.resolve({ id: "TEST01" }) },
    );

    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  test("400 when player targets themselves", async () => {
    vi.mocked(sessionStore.getSession).mockResolvedValue(
      mockSession({
        pendingAction: {
          type: "mime",
          card: { cardTitle: "Cat", cardText: "Cat" },
          actorPlayerId: "0",
        },
      }),
    );
    vi.mocked(sessionStore.saveSession).mockResolvedValue(undefined);

    const res = await selectTargetPOST(
      makeSelectTargetReq({ playerId: "0", targetId: "0" }),
      { params: Promise.resolve({ id: "TEST01" }) },
    );

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  test("409 when target is already set", async () => {
    vi.mocked(sessionStore.getSession).mockResolvedValue(
      mockSession({
        pendingAction: {
          type: "mime",
          card: { cardTitle: "Cat", cardText: "Cat" },
          actorPlayerId: "0",
          targetPlayerId: "1",
        },
      }),
    );
    vi.mocked(sessionStore.saveSession).mockResolvedValue(undefined);

    const res = await selectTargetPOST(
      makeSelectTargetReq({ playerId: "0", targetId: "1" }),
      { params: Promise.resolve({ id: "TEST01" }) },
    );

    expect(res.status).toBe(409);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  test("success: saveSession called with targetPlayerId set", async () => {
    vi.mocked(sessionStore.getSession).mockResolvedValue(
      mockSession({
        pendingAction: {
          type: "mime",
          card: { cardTitle: "Cat", cardText: "Cat" },
          actorPlayerId: "0",
        },
      }),
    );
    vi.mocked(sessionStore.saveSession).mockResolvedValue(undefined);

    const res = await selectTargetPOST(
      makeSelectTargetReq({ playerId: "0", targetId: "1" }),
      { params: Promise.resolve({ id: "TEST01" }) },
    );

    expect(res.status).toBe(200);
    const saved = vi.mocked(sessionStore.saveSession).mock.calls[0][1];
    expect(saved.pendingAction?.targetPlayerId).toBe("1");
  });

  test("success: hostToken is not exposed", async () => {
    vi.mocked(sessionStore.getSession).mockResolvedValue(
      mockSession({
        pendingAction: {
          type: "mime",
          card: { cardTitle: "Cat", cardText: "Cat" },
          actorPlayerId: "0",
        },
      }),
    );
    vi.mocked(sessionStore.saveSession).mockResolvedValue(undefined);

    const res = await selectTargetPOST(
      makeSelectTargetReq({ playerId: "0", targetId: "1" }),
      { params: Promise.resolve({ id: "TEST01" }) },
    );

    const data = await res.json();
    expect(data.hostToken).toBeUndefined();
  });
});
