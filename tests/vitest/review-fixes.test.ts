// @vitest-environment node
import { afterEach, describe, expect, test, vi } from "vitest";
import { validateBoardConfig } from "@/lib/board-config";
import { Battle } from "@/model/battle";
import { Board } from "@/model/board";
import { Game } from "@/model/game";
import { firstBattle } from "@/model/managers/action-result";
import { Player } from "@/model/player";
import {
  DictationDraw,
  DictationDrawSquare,
  QuizSquare,
  Square,
} from "@/model/square";
import type { SessionState } from "@/types/session";

vi.mock("@/lib/session-store", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/session-store")>();
  return { ...actual, getSession: vi.fn(), saveSession: vi.fn() };
});

import { POST as actionPOST } from "@/app/api/sessions/[id]/action/route";
import { POST as joinPOST } from "@/app/api/sessions/[id]/join/route";
import * as sessionStore from "@/lib/session-store";

afterEach(() => {
  vi.clearAllMocks();
});

/** Partita con le caselle e le posizioni indicate (posizioni per indice di giocatore). */
function makeGame(squares: Square[], positions: number[]) {
  const names = ["Alice", "Bob", "Carl"].slice(0, positions.length);
  const players = names.map((n, i) => new Player(i, n));
  const board = new Board(squares, players);
  players.forEach((p, i) => {
    board.movePlayer(p, positions[i]);
  });
  return new Game(board);
}

function plainSquares(n: number) {
  return Array.from({ length: n }, (_, i) => new Square(i));
}

function mockSession(
  game: Game,
  overrides: Partial<SessionState> = {},
): SessionState {
  return {
    sessionId: "TEST01",
    hostToken: "host-tok",
    players: game
      .getPlayers()
      .map((p) => ({ id: String(p.getId()), name: p.getName() })),
    started: true,
    gameState: game.toJSON(),
    currentPlayerId: "0",
    pendingAction: null,
    diceResult: null,
    lastMoveInfo: null,
    gameOver: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  };
}

function actionReq(body: object) {
  return new Request("http://localhost/api/sessions/TEST01/action", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const params = { params: Promise.resolve({ id: "TEST01" }) };

describe("Game.fromJSON", () => {
  test("Disegno dettato riuscito sull'ultima casella termina la partita", () => {
    const players = ["Alice", "Bob"].map((n, i) => new Player(i, n));
    const board = new Board(
      [new Square(0), new DictationDrawSquare(1), new Square(2)],
      players,
    );
    const game = new Game(board, 1);
    const turn = game.playTurn();
    expect(turn.type).toBe("dictation-draw");

    // Come nello store e nelle API: la partita è ricostruita prima di risolvere
    const restored = Game.fromJSON(game.toJSON());
    const [alice, bob] = restored.getPlayers();
    restored.resolveDictationDraw(
      new DictationDraw(alice, (turn.data as DictationDraw).cardTopic, ""),
      true,
      bob,
    );

    expect(restored.isGameEnded()).toBe(true);
    expect(restored.getWinner()?.getName()).toBe("Alice");
  });
});

describe("BattleManager", () => {
  test("il vincitore che raggiunge una casella Quiz attiva il Quiz", () => {
    const squares = plainSquares(5);
    squares[2] = new QuizSquare(2);
    const game = makeGame(squares, [1, 1]);
    const [alice, bob] = game.getPlayers();

    const result = game.resolveBattle(new Battle(alice, bob), alice);

    expect(result.type).toBe("quiz");
  });
});

describe("firstBattle", () => {
  test("ignora la collisione tra i due partner di una sfida a coppie", () => {
    const [a, b, c] = [0, 1, 2].map((i) => new Player(i, `P${i}`));
    expect(firstBattle([null, new Battle(b, a)], [a, b])).toBeNull();
    expect(firstBattle([new Battle(a, c), null], [a, b])?.getPlayers()).toEqual(
      [a, c],
    );
  });
});

describe("POST /api/sessions/[id]/action: azioni successive", () => {
  test("Mimo riuscito che porta su un terzo giocatore apre una Battaglia", async () => {
    const game = makeGame(plainSquares(10), [0, 0, 1]);
    vi.mocked(sessionStore.getSession).mockResolvedValue(
      mockSession(game, {
        pendingAction: {
          type: "mime",
          card: { cardTitle: "Gatto", cardText: "Gatto" },
          actorPlayerId: "0",
        },
      }),
    );

    const res = await actionPOST(
      actionReq({ hostToken: "host-tok", success: true, winnerId: "1" }),
      params,
    );
    const data = await res.json();

    expect(data.pendingAction).toMatchObject({
      type: "battle",
      actorPlayerId: "0",
      targetPlayerId: "2",
    });
  });

  test("Battaglia vinta su una casella Quiz: il Quiz passa al vincitore", async () => {
    const squares = plainSquares(10);
    squares[2] = new QuizSquare(2);
    const game = makeGame(squares, [1, 1]);
    vi.mocked(sessionStore.getSession).mockResolvedValue(
      mockSession(game, {
        pendingAction: {
          type: "battle",
          card: null,
          actorPlayerId: "0",
          targetPlayerId: "1",
        },
      }),
    );

    const res = await actionPOST(
      actionReq({ hostToken: "host-tok", success: true, winnerId: "1" }),
      params,
    );
    const data = await res.json();

    expect(data.pendingAction).toMatchObject({
      type: "quiz",
      actorPlayerId: "1",
    });
  });
});

describe("POST /api/sessions/[id]/join", () => {
  test("409 quando la sessione ha già 10 giocatori", async () => {
    const game = makeGame(plainSquares(10), [0, 0]);
    vi.mocked(sessionStore.getSession).mockResolvedValue(
      mockSession(game, {
        started: false,
        players: Array.from({ length: 10 }, (_, i) => ({
          id: String(i),
          name: `P${i}`,
        })),
      }),
    );

    const res = await joinPOST(
      new Request("http://localhost/api/sessions/TEST01/join", {
        method: "POST",
        body: JSON.stringify({ playerName: "Zoe" }),
      }),
      params,
    );

    expect(res.status).toBe(409);
    expect(sessionStore.saveSession).not.toHaveBeenCalled();
  });
});

describe("withSessionLock (in memoria)", () => {
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  test("le operazioni sulla stessa sessione non si sovrappongono", async () => {
    const order: string[] = [];
    const task = (name: string) =>
      sessionStore.withSessionLock("LOCK01", async () => {
        order.push(`${name}:start`);
        await sleep(10);
        order.push(`${name}:end`);
        return new Response(name);
      });

    await Promise.all([task("a"), task("b"), task("c")]);

    expect(order).toEqual([
      "a:start",
      "a:end",
      "b:start",
      "b:end",
      "c:start",
      "c:end",
    ]);
  });

  test("un errore libera il lock per l'operazione successiva", async () => {
    const failing = sessionStore.withSessionLock("LOCK02", async () => {
      throw new Error("boom");
    });
    const next = sessionStore.withSessionLock(
      "LOCK02",
      async () => new Response("ok"),
    );

    await expect(failing).rejects.toThrow("boom");
    expect(await (await next).text()).toBe("ok");
  });
});

describe("validateBoardConfig", () => {
  const valid = {
    numSquares: 20,
    specialPercentage: 20,
    squareTypes: { quiz: true, mime: false },
    battlesEnabled: true,
    customSquares: null,
  };

  test("accetta una configurazione valida", () => {
    expect(validateBoardConfig(valid)).toBeNull();
  });

  test.each([
    ["boardConfig mancante", undefined],
    ["troppe caselle", { ...valid, numSquares: 1_000_000 }],
    ["poche caselle", { ...valid, numSquares: 5 }],
    ["caselle non intere", { ...valid, numSquares: 20.5 }],
    ["percentuale fuori scala", { ...valid, specialPercentage: 150 }],
    ["squareTypes non booleani", { ...valid, squareTypes: { quiz: "si" } }],
    ["battlesEnabled non booleano", { ...valid, battlesEnabled: "no" }],
  ])("rifiuta: %s", (_, config) => {
    expect(validateBoardConfig(config)).not.toBeNull();
  });

  test("controlla il tabellone personalizzato", () => {
    const squares = Array.from({ length: 10 }, (_, i) => ({
      number: i,
      type: "normal",
    }));
    const config = { ...valid, numSquares: 10 };
    expect(
      validateBoardConfig({ ...config, customSquares: squares }),
    ).toBeNull();

    const badType = squares.map((sq, i) =>
      i === 3 ? { ...sq, type: "boom" } : sq,
    );
    expect(
      validateBoardConfig({ ...config, customSquares: badType }),
    ).not.toBeNull();

    const badMove = squares.map((sq, i) =>
      i === 3 ? { number: 3, type: "move", moveValue: 50 } : sq,
    );
    expect(
      validateBoardConfig({ ...config, customSquares: badMove }),
    ).not.toBeNull();
  });
});
