import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

// Dado controllato dal test
const dice = vi.hoisted(() => ({ value: 1 }));
vi.mock("@/model/dice", () => ({
  Dice: class {
    constructor(public faces: number) {}
    roll() {
      return dice.value;
    }
  },
}));

// Suoni e voce sostituiti da spie
const sound = vi.hoisted(() => ({
  playDiceRoll: vi.fn(),
  playTurnSkip: vi.fn(),
  speakTurnSkip: vi.fn(),
  speakDiceResult: vi.fn(),
  playVictory: vi.fn(),
  speakVictory: vi.fn(),
  playBattle: vi.fn(),
  playSpecialSquare: vi.fn(),
}));
vi.mock("@/app/utils/sound-manager", () => ({ soundManager: sound }));

import { Battle } from "@/model/battle";
import { Board } from "@/model/board";
import {
  BackWrite,
  Card,
  DictationDraw,
  FaceEmotion,
  Film,
  Mime,
  MusicEmotion,
  PhysicalTest,
  Quiz,
  WhatWouldYouDo,
} from "@/model/deck";
import { Game } from "@/model/game";
import { Player } from "@/model/player";
import type { SquareJSON, SquareType } from "@/model/square/square";
import {
  ACTION_TYPE_LABELS,
  type GameState,
  useCurrentPlayer,
  useGame,
  useGameActions,
  useGameState,
  useGameStore,
} from "@/store/game-store";

const LUCIA = 0;
const RENZO = 1;

/** Partita a due giocatori; `squares` sono tipi o caselle complete. */
function makeGame(
  squares: (SquareType | SquareJSON)[] | number = 10,
  positions: [number, number] = [0, 0],
) {
  const list =
    typeof squares === "number"
      ? Array.from({ length: squares }, () => "normal" as const)
      : squares;
  const players = ["Lucia", "Renzo"].map((name, id) => new Player(id, name));
  const board = Board.fromJSON(
    {
      playersPosition: players.map((p, i) => ({
        playerId: p.getId(),
        position: positions[i],
      })),
      squares: list.map((s, number) =>
        typeof s === "string" ? { number, type: s } : s,
      ),
    },
    players,
  );
  return new Game(board);
}

const store = () => useGameStore.getState();
const actions = () => store().actions;
const player = (game: Game, id: number) =>
  game.getPlayers().find((p) => p.getId() === id) as Player;
const position = (id: number) => {
  const game = store().game as Game;
  return game.getPlayerPosition(player(game, id));
};

/** Mette nello store una partita con una sfida aperta. */
function openAction(
  game: Game,
  actionType: string,
  actionData: GameState["actionData"],
) {
  useGameStore.setState({
    game,
    gameData: game.toJSON(),
    actionType,
    actionData,
    isModalOpen: true,
  });
}

const card = new Card("titolo", "testo");

beforeEach(() => {
  vi.useFakeTimers();
  vi.clearAllMocks();
  dice.value = 1;
  actions().deleteGame();
  useGameStore.setState({ hasSavedGame: false, selectedFile: null });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("gestione della partita", () => {
  test("setGame salva partita e JSON", () => {
    const game = makeGame();
    actions().setGame(game);
    expect(store().game).toBe(game);
    expect(store().gameData).toEqual(game.toJSON());
    actions().setGame(null);
    expect(store().gameData).toBeNull();
  });

  test("loadGame ricostruisce la partita dal JSON salvato", () => {
    const game = makeGame();
    useGameStore.setState({ game: null, gameData: game.toJSON() });
    actions().restoreFromLocalStorage();
    expect(store().game?.toJSON()).toEqual(game.toJSON());
  });

  test("loadGame senza JSON non fa niente", () => {
    actions().loadGame();
    expect(store().game).toBeNull();
  });

  test("loadGame con JSON non valido azzera la partita", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    useGameStore.setState({
      gameData: { broken: true } as unknown as GameState["gameData"],
    });
    actions().loadGame();
    expect(store().game).toBeNull();
    expect(store().gameData).toBeNull();
    expect(error).toHaveBeenCalled();
    error.mockRestore();
  });

  test("deleteGame azzera partita e finestre", () => {
    openAction(makeGame(), "quiz", null);
    actions().deleteGame();
    expect(store().game).toBeNull();
    expect(store().isModalOpen).toBe(false);
    expect(store().actionType).toBeNull();
  });

  test("checkSavedGame e setSelectedFile", () => {
    actions().checkSavedGame();
    expect(store().hasSavedGame).toBe(false);
    actions().setGame(makeGame());
    actions().checkSavedGame();
    expect(store().hasSavedGame).toBe(true);

    const file = new File(["{}"], "partita.json");
    actions().setSelectedFile(file);
    expect(store().selectedFile).toBe(file);
  });

  test("persiste solo il JSON della partita", () => {
    actions().setGame(makeGame());
    const saved = JSON.parse(localStorage.getItem("game-store") ?? "{}");
    expect(Object.keys(saved.state).sort()).toEqual([
      "gameData",
      "hasSavedGame",
    ]);
    expect(saved.state.hasSavedGame).toBe(true);
  });
});

describe("finestre e dado", () => {
  test("openDiceModal, continueAfterDice, resetDiceState, closeModal", () => {
    actions().openDiceModal();
    expect(store().isDiceModalOpen).toBe(true);

    useGameStore.setState({
      modalDiceResult: 4,
      playerWhoRolledName: "Lucia",
    });
    actions().continueAfterDice();
    expect(store().isDiceModalOpen).toBe(false);
    expect(store().modalDiceResult).toBeNull();
    expect(store().playerWhoRolledName).toBeNull();

    useGameStore.setState({ isRolling: true, diceResult: 3 });
    actions().resetDiceState();
    expect(store().isRolling).toBe(false);
    expect(store().diceResult).toBeNull();

    useGameStore.setState({ isModalOpen: true, newPosition: 3 });
    actions().closeModal();
    expect(store().isModalOpen).toBe(false);
    expect(store().newPosition).toBeUndefined();
  });
});

describe("playTurn", () => {
  test("senza partita non fa niente", () => {
    actions().playTurn();
    expect(sound.playDiceRoll).not.toHaveBeenCalled();
  });

  test("turno normale: anima, poi aggiorna posizione e annuncia", () => {
    dice.value = 2;
    actions().setGame(makeGame());
    actions().playTurn();

    expect(sound.playDiceRoll).toHaveBeenCalled();
    expect(store().isRolling).toBe(true);
    expect(store().playerWhoRolledName).toBe("Lucia");

    vi.advanceTimersByTime(1000);
    expect(store().isRolling).toBe(false);
    expect(store().startPosition).toBe(0);
    expect(store().newPosition).toBe(2);
    expect(store().diceResult).toBe(2);
    expect(store().modalDiceResult).toBe(2);
    expect(store().isModalOpen).toBe(false);
    expect(position(LUCIA)).toBe(2);
    expect(sound.speakDiceResult).toHaveBeenCalledWith("Lucia", 2, 2, null);
    expect(sound.playSpecialSquare).not.toHaveBeenCalled();
  });

  test("casella speciale: apre la sfida e annuncia la casella", () => {
    dice.value = 2;
    actions().setGame(
      makeGame(["normal", "normal", "quiz", "normal", "normal"]),
    );
    actions().playTurn();
    vi.advanceTimersByTime(1000);

    expect(store().actionType).toBe("quiz");
    expect(store().actionData).toBeInstanceOf(Quiz);
    expect(store().isModalOpen).toBe(true);
    expect(sound.playSpecialSquare).toHaveBeenCalled();
    expect(sound.speakDiceResult).toHaveBeenCalledWith(
      "Lucia",
      2,
      2,
      ACTION_TYPE_LABELS.quiz,
    );
  });

  test("casella di movimento: apre la finestra anche senza sfida", () => {
    dice.value = 2;
    actions().setGame(
      makeGame([
        "normal",
        "normal",
        { number: 2, type: "move", moveValue: 2 } as SquareJSON,
        "normal",
        "normal",
        "normal",
        "normal",
      ]),
    );
    actions().playTurn();
    vi.advanceTimersByTime(1000);

    expect(store().newPosition).toBe(4);
    expect(store().actionType).toBeNull();
    expect(store().isModalOpen).toBe(true);
    expect(sound.playSpecialSquare).toHaveBeenCalled();
  });

  test("collisione: apre la battaglia", () => {
    actions().setGame(makeGame());
    actions().playTurn();
    vi.advanceTimersByTime(1000);
    actions().playTurn();
    vi.advanceTimersByTime(1000);

    expect(store().actionType).toBe("battle");
    expect(store().actionData).toBeInstanceOf(Battle);
    expect(sound.playBattle).toHaveBeenCalled();
    expect(store().isModalOpen).toBe(true);
  });

  test("arrivo: festeggia il vincitore", () => {
    dice.value = 6;
    actions().setGame(makeGame(5));
    actions().playTurn();
    vi.advanceTimersByTime(1000);

    expect(store().game?.isGameEnded()).toBe(true);
    expect(sound.playVictory).toHaveBeenCalled();
    expect(sound.speakVictory).toHaveBeenCalledWith("Lucia");
    expect(sound.speakDiceResult).not.toHaveBeenCalled();
  });

  test("turno saltato: niente animazione", () => {
    const game = makeGame();
    player(game, LUCIA).skipNextTurn();
    actions().setGame(game);
    actions().playTurn();

    expect(store().diceResult).toBe(0);
    expect(store().isRolling).toBe(false);
    expect(store().startPosition).toBe(0);
    expect(store().newPosition).toBe(0);
    expect(sound.playTurnSkip).toHaveBeenCalled();
    expect(sound.speakTurnSkip).toHaveBeenCalledWith("Lucia");
    expect(store().game).not.toBe(game);
  });
});

describe("resolveBattle", () => {
  const battleGame = (squares: (SquareType | SquareJSON)[] | number = 10) => {
    const game = makeGame(squares, [1, 1]);
    const battle = new Battle(player(game, LUCIA), player(game, RENZO));
    openAction(game, "battle", battle);
    return game;
  };

  test("il vincitore avanza e la finestra si chiude", () => {
    battleGame();
    actions().resolveBattle(LUCIA);
    expect(position(LUCIA)).toBe(2);
    expect(position(RENZO)).toBe(1);
    expect(store().isModalOpen).toBe(false);
  });

  test("se il vincitore arriva su una sfida, la apre", () => {
    battleGame(["normal", "normal", "quiz", "normal", "normal"]);
    actions().resolveBattle(RENZO);
    expect(store().actionType).toBe("quiz");
    expect(store().isModalOpen).toBe(true);
    expect(sound.playSpecialSquare).toHaveBeenCalled();
    expect(sound.playBattle).not.toHaveBeenCalled();
  });

  test("vincitore sconosciuto o finestra diversa: niente", () => {
    const game = battleGame();
    actions().resolveBattle(99);
    expect(store().game).toBe(game);
    expect(store().actionType).toBe("battle");

    useGameStore.setState({ actionType: "quiz" });
    actions().resolveBattle(LUCIA);
    expect(store().game).toBe(game);
  });

  test("giocatori della battaglia non più in partita: niente", () => {
    const game = makeGame(10, [1, 1]);
    const strangers = new Battle(new Player(7, "X"), new Player(8, "Y"));
    openAction(game, "battle", strangers);
    actions().resolveBattle(LUCIA);
    expect(store().game).toBe(game);
  });
});

describe("resolveQuiz", () => {
  test("risposta giusta: avanza", () => {
    const game = makeGame();
    openAction(game, "quiz", new Quiz(player(game, LUCIA), card));
    actions().resolveQuiz(true);
    expect(position(LUCIA)).toBe(1);
    expect(store().isModalOpen).toBe(false);
    expect(store().actionType).toBeNull();
  });

  test("risposta sbagliata: salta il prossimo turno", () => {
    const game = makeGame();
    openAction(game, "quiz", new Quiz(player(game, LUCIA), card));
    actions().resolveQuiz(false);
    const updated = store().game as Game;
    expect(player(updated, LUCIA).getTurnsToSkip()).toBeGreaterThan(0);
  });

  test("avanzando raggiunge un altro giocatore: battaglia", () => {
    const game = makeGame(10, [0, 1]);
    openAction(game, "quiz", new Quiz(player(game, LUCIA), card));
    actions().resolveQuiz(true);
    expect(store().actionType).toBe("battle");
    expect(store().isModalOpen).toBe(true);
    expect(sound.playBattle).toHaveBeenCalled();
  });

  test("avanzando arriva al traguardo: vittoria", () => {
    const game = makeGame(3, [1, 0]);
    openAction(game, "quiz", new Quiz(player(game, LUCIA), card));
    actions().resolveQuiz(true);
    expect(store().game?.isGameEnded()).toBe(true);
    expect(sound.playVictory).toHaveBeenCalled();
    expect(sound.speakVictory).toHaveBeenCalledWith("Lucia");
    expect(store().isModalOpen).toBe(false);
  });
});

/** Ogni sfida: tipo, carta e chiamata di risoluzione. */
const challenges: {
  type: string;
  make: (p: Player) => NonNullable<GameState["actionData"]>;
  resolve: (success: boolean) => void;
}[] = [
  {
    type: "mime",
    make: (p) => new Mime(p, card),
    resolve: (s) => actions().resolveMime(s, RENZO),
  },
  {
    type: "quiz",
    make: (p) => new Quiz(p, card),
    resolve: (s) => actions().resolveQuiz(s),
  },
  {
    type: "backwrite",
    make: (p) => new BackWrite(p, card),
    resolve: (s) => actions().resolveBackWrite(s, RENZO),
  },
  {
    type: "face-emotion",
    make: (p) => new FaceEmotion(p, card, "/api/faces/x.jpg"),
    resolve: (s) => actions().resolveFaceEmotion(s),
  },
  {
    type: "film",
    make: (p) => new Film(p, card, "/videos/x.mp4"),
    resolve: (s) => actions().resolveFilm(s),
  },
  {
    type: "music-emotion",
    make: (p) => new MusicEmotion(p, card),
    resolve: (s) => actions().resolveMusicEmotion(s),
  },
  {
    type: "physical-test",
    make: (p) => new PhysicalTest(p, card),
    resolve: (s) => actions().resolvePhysicalTest(s),
  },
  {
    type: "what-would-you-do",
    make: (p) => new WhatWouldYouDo(p, card),
    resolve: (s) => actions().resolveWhatWouldYouDo(s),
  },
  {
    type: "dictation-draw",
    make: (p) => new DictationDraw(p, card, "/images/x.png"),
    resolve: (s) => actions().resolveDictationDraw(s, RENZO),
  },
];

describe.each(challenges)("risoluzione $type", ({ type, make, resolve }) => {
  test.each([true, false])("esito %s: aggiorna la partita e chiude", (ok) => {
    const game = makeGame();
    openAction(game, type, make(player(game, LUCIA)));
    resolve(ok);
    expect(store().game).not.toBe(game);
    expect(store().isModalOpen).toBe(false);
    expect(store().actionType).toBeNull();
  });

  test("giocatore non più in partita: chiude senza cambiare la partita", () => {
    const game = makeGame();
    openAction(game, type, make(new Player(42, "Assente")));
    resolve(true);
    expect(store().game).toBe(game);
    expect(store().isModalOpen).toBe(false);
  });

  test("finestra di un'altra sfida o senza dati: niente", () => {
    const game = makeGame();
    openAction(game, "battle", make(player(game, LUCIA)));
    resolve(true);
    expect(store().game).toBe(game);
    expect(store().isModalOpen).toBe(true);

    openAction(game, type, null);
    resolve(true);
    expect(store().isModalOpen).toBe(true);
  });
});

describe("sfide senza compagno indicato", () => {
  test.each([
    ["mime", () => actions().resolveMime(true)],
    ["backwrite", () => actions().resolveBackWrite(true)],
    ["dictation-draw", () => actions().resolveDictationDraw(true)],
  ] as const)("%s", (type, resolve) => {
    const game = makeGame();
    const challenge = challenges.find((c) => c.type === type);
    openAction(game, type, challenge?.make(player(game, LUCIA)) ?? null);
    resolve();
    expect(store().isModalOpen).toBe(false);
  });
});

describe("loadFromFile", () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  test("senza file selezionato rifiuta", async () => {
    await expect(actions().loadFromFile()).rejects.toThrow("No file selected");
  });

  test("carica una partita valida", async () => {
    const game = makeGame();
    actions().setSelectedFile(
      new File([JSON.stringify(game.toJSON())], "partita.json"),
    );
    await actions().loadFromFile();
    expect(store().game?.toJSON()).toEqual(game.toJSON());
    expect(store().gameData).toEqual(game.toJSON());
    expect(store().selectedFile).toBeNull();
  });

  test.each([
    ["non JSON", "non è json"],
    ["JSON non valido", JSON.stringify({ board: 1 })],
  ])("rifiuta un file %s", async (_, content) => {
    actions().setSelectedFile(new File([content], "partita.json"));
    await expect(actions().loadFromFile()).rejects.toThrow(
      "Invalid file format",
    );
    expect(store().game).toBeNull();
  });

  test("errore di lettura", async () => {
    vi.stubGlobal(
      "FileReader",
      class {
        onerror: (() => void) | null = null;
        readAsText() {
          this.onerror?.();
        }
      },
    );
    actions().setSelectedFile(new File(["{}"], "partita.json"));
    await expect(actions().loadFromFile()).rejects.toThrow(
      "Failed to read file",
    );
  });
});

describe("hook", () => {
  test("useGameState, useGameActions, useGame", () => {
    const game = makeGame();
    actions().setGame(game);
    expect(renderHook(() => useGameState()).result.current.game).toBe(game);
    expect(renderHook(() => useGameActions()).result.current).toBe(
      store().actions,
    );
    expect(renderHook(() => useGame()).result.current).toBe(game);
  });

  test("useCurrentPlayer", () => {
    expect(renderHook(() => useCurrentPlayer()).result.current).toBeNull();

    const game = makeGame();
    actions().setGame(game);
    expect(renderHook(() => useCurrentPlayer()).result.current).toBe(
      player(game, LUCIA),
    );

    // Durante la finestra resta il giocatore che ha lanciato
    useGameStore.setState({
      playerWhoRolled: player(game, RENZO),
      isModalOpen: true,
    });
    expect(renderHook(() => useCurrentPlayer()).result.current).toBe(
      player(game, RENZO),
    );
    useGameStore.setState({ isModalOpen: false, isDiceModalOpen: true });
    expect(renderHook(() => useCurrentPlayer()).result.current).toBe(
      player(game, RENZO),
    );
  });
});
