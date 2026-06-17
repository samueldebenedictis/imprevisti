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

import { GET } from "@/app/api/sessions/[id]/route";
import { POST } from "@/app/api/sessions/route";
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
    updatedAt: 1000,
    createdAt: 1000,
    ...overrides,
  };
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/sessions (create session)", () => {
  test("returns sessionId of length 6", async () => {
    vi.mocked(sessionStore.saveSession).mockResolvedValue(undefined);

    const res = await POST(
      new Request("http://localhost/api/sessions", { method: "POST" }),
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(typeof data.sessionId).toBe("string");
    expect(data.sessionId).toHaveLength(6);
  });

  test("returns a hostToken", async () => {
    vi.mocked(sessionStore.saveSession).mockResolvedValue(undefined);

    const res = await POST(
      new Request("http://localhost/api/sessions", { method: "POST" }),
    );
    const data = await res.json();
    expect(data.hostToken).toBeTruthy();
    expect(typeof data.hostToken).toBe("string");
  });

  test("sessionId is uppercase", async () => {
    vi.mocked(sessionStore.saveSession).mockResolvedValue(undefined);

    const res = await POST(
      new Request("http://localhost/api/sessions", { method: "POST" }),
    );
    const data = await res.json();
    expect(data.sessionId).toBe(data.sessionId.toUpperCase());
  });

  test("calls saveSession with updatedAt > 0", async () => {
    vi.mocked(sessionStore.saveSession).mockResolvedValue(undefined);

    await POST(
      new Request("http://localhost/api/sessions", { method: "POST" }),
    );

    expect(vi.mocked(sessionStore.saveSession).mock.calls).toHaveLength(1);
    const saved = vi.mocked(sessionStore.saveSession).mock.calls[0][1];
    expect(saved.updatedAt).toBeGreaterThan(0);
  });

  test("calls saveSession with empty players and started=false", async () => {
    vi.mocked(sessionStore.saveSession).mockResolvedValue(undefined);

    await POST(
      new Request("http://localhost/api/sessions", { method: "POST" }),
    );

    const saved = vi.mocked(sessionStore.saveSession).mock.calls[0][1];
    expect(saved.players).toHaveLength(0);
    expect(saved.started).toBe(false);
    expect(saved.gameState).toBeNull();
    expect(saved.currentPlayerId).toBeNull();
  });

  test("saveSession called with sessionId matching the returned sessionId", async () => {
    vi.mocked(sessionStore.saveSession).mockResolvedValue(undefined);

    const res = await POST(
      new Request("http://localhost/api/sessions", { method: "POST" }),
    );
    const data = await res.json();

    const savedId = vi.mocked(sessionStore.saveSession).mock.calls[0][0];
    expect(savedId).toBe(data.sessionId);
  });
});

describe("GET /api/sessions/[id] (long-poll)", () => {
  test("returns 404 when session not found", async () => {
    vi.mocked(sessionStore.getSession).mockResolvedValue(null);

    const res = await GET(
      new Request("http://localhost/api/sessions/NOTFOUND"),
      { params: Promise.resolve({ id: "NOTFOUND" }) },
    );
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  test("without ?since: returns 200 immediately", async () => {
    vi.mocked(sessionStore.getSession).mockResolvedValue(
      mockSession({ updatedAt: 1000 }),
    );

    const res = await GET(new Request("http://localhost/api/sessions/TEST01"), {
      params: Promise.resolve({ id: "TEST01" }),
    });
    expect(res.status).toBe(200);
  });

  test("without ?since: hostToken is stripped from response", async () => {
    vi.mocked(sessionStore.getSession).mockResolvedValue(
      mockSession({ updatedAt: 1000 }),
    );

    const res = await GET(new Request("http://localhost/api/sessions/TEST01"), {
      params: Promise.resolve({ id: "TEST01" }),
    });
    const data = await res.json();
    expect(data.hostToken).toBeUndefined();
  });

  test("without ?since: public fields are returned", async () => {
    vi.mocked(sessionStore.getSession).mockResolvedValue(
      mockSession({ updatedAt: 1000 }),
    );

    const res = await GET(new Request("http://localhost/api/sessions/TEST01"), {
      params: Promise.resolve({ id: "TEST01" }),
    });
    const data = await res.json();
    expect(data.sessionId).toBe("TEST01");
    expect(data.players).toBeDefined();
    expect(data.started).toBeDefined();
  });

  test("with ?since different from updatedAt: returns immediately", async () => {
    vi.mocked(sessionStore.getSession).mockResolvedValue(
      mockSession({ updatedAt: 1000 }),
    );

    const res = await GET(
      new Request("http://localhost/api/sessions/TEST01?since=999"),
      { params: Promise.resolve({ id: "TEST01" }) },
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.hostToken).toBeUndefined();
    expect(data.sessionId).toBe("TEST01");
  });

  test("with ?since equal to updatedAt: times out after 8s and returns 200", async () => {
    vi.useFakeTimers();
    vi.mocked(sessionStore.getSession).mockResolvedValue(
      mockSession({ updatedAt: 1000 }),
    );

    const req = new Request("http://localhost/api/sessions/TEST01?since=1000");
    const responsePromise = GET(req, {
      params: Promise.resolve({ id: "TEST01" }),
    });

    // Advance past the 8s deadline
    await vi.advanceTimersByTimeAsync(9000);

    const res = await responsePromise;
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.hostToken).toBeUndefined();

    vi.useRealTimers();
  });

  test("with ?since equal to updatedAt and session disappears: returns 404", async () => {
    vi.useFakeTimers();
    // First call returns session (matching since), later calls return null
    vi.mocked(sessionStore.getSession)
      .mockResolvedValueOnce(mockSession({ updatedAt: 1000 }))
      .mockResolvedValue(null);

    const req = new Request("http://localhost/api/sessions/TEST01?since=1000");
    const responsePromise = GET(req, {
      params: Promise.resolve({ id: "TEST01" }),
    });

    // Advance one polling cycle (300ms) so a second getSession call is made
    await vi.advanceTimersByTimeAsync(400);

    const res = await responsePromise;
    expect(res.status).toBe(404);

    vi.useRealTimers();
  });
});
