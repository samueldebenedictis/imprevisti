import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, test } from "vitest";
import { defaultPawn } from "@/model/pawn";
import {
  useConfigActions,
  useConfigStore,
  useConfigValidation,
  useGameConfig,
} from "@/store/config-store";
import { useGameStore } from "@/store/game-store";
import { MAX_PLAYERS, MIN_PLAYERS } from "@/vars";

const actions = () => useConfigStore.getState().actions;
const state = () => useConfigStore.getState();

beforeEach(() => {
  actions().resetConfig();
  useGameStore.getState().actions.deleteGame();
});

describe("giocatori", () => {
  test("setNumPlayers mantiene i nomi già inseriti", () => {
    actions().setPlayerName(0, "Lucia");
    actions().setNumPlayers(3);
    expect(state().numPlayers).toBe(3);
    expect(state().playerNames).toEqual(["Lucia", "", ""]);
    actions().setNumPlayers(1);
    expect(state().playerNames).toEqual(["Lucia"]);
  });

  test("setPlayerName allunga l'elenco se serve", () => {
    actions().setPlayerName(3, "Renzo");
    expect(state().playerNames).toEqual(["", "", "", "Renzo"]);
  });

  test("addPlayer aggiunge un giocatore fino al massimo", () => {
    actions().setNumPlayers(MAX_PLAYERS - 1);
    actions().addPlayer();
    expect(state().numPlayers).toBe(MAX_PLAYERS);
    expect(state().playerNames).toHaveLength(MAX_PLAYERS);
    actions().addPlayer();
    expect(state().numPlayers).toBe(MAX_PLAYERS);
  });

  test("removePlayer toglie il giocatore indicato, non sotto il minimo", () => {
    actions().setNumPlayers(MIN_PLAYERS + 1);
    ["Lucia", "Renzo", "Agnese"].forEach((name, i) => {
      actions().setPlayerName(i, name);
    });
    actions().removePlayer(1);
    expect(state().numPlayers).toBe(MIN_PLAYERS);
    expect(state().playerNames).toEqual(["Lucia", "Agnese"]);
    actions().removePlayer(0);
    expect(state().numPlayers).toBe(MIN_PLAYERS);
    expect(state().playerNames).toEqual(["Lucia", "Agnese"]);
  });
});

describe("impostazioni della partita", () => {
  test("setter semplici", () => {
    actions().setNumSquares(42);
    actions().setSquareType("mime", false);
    actions().setSpecialPercentage(55);
    actions().setBattlesEnabled(false);
    expect(state().numSquares).toBe(42);
    expect(state().squareTypes.mime).toBe(false);
    expect(state().squareTypes.quiz).toBe(true);
    expect(state().specialPercentage).toBe(55);
    expect(state().battlesEnabled).toBe(false);
  });

  test("setCustomSquares e clearCustomSquares", () => {
    actions().setCustomSquares([{ number: 0, type: "normal" }]);
    expect(state().customSquares).toEqual([{ number: 0, type: "normal" }]);
    actions().clearCustomSquares();
    expect(state().customSquares).toBeNull();
  });
});

describe("validateConfig", () => {
  const withNames = (...names: string[]) => {
    actions().setNumPlayers(names.length);
    names.forEach((name, i) => {
      actions().setPlayerName(i, name);
    });
  };

  test("valida con nomi, giocatori e caselle nei limiti", () => {
    withNames("Lucia", "Renzo");
    expect(actions().validateConfig()).toBe(true);
  });

  test("non valida con un nome vuoto o solo spazi", () => {
    withNames("Lucia", "   ");
    expect(actions().validateConfig()).toBe(false);
  });

  test("non valida con troppi pochi giocatori o caselle fuori limite", () => {
    withNames("Lucia");
    expect(actions().validateConfig()).toBe(false);
    withNames("Lucia", "Renzo");
    actions().setNumSquares(5);
    expect(actions().validateConfig()).toBe(false);
  });
});

describe("createGame", () => {
  test("rifiuta una configurazione non valida", () => {
    expect(() => actions().createGame()).toThrow("Invalid game configuration");
    expect(useGameStore.getState().game).toBeNull();
  });

  test("crea la partita con tabellone generato", () => {
    actions().setPlayerName(0, " Lucia ");
    actions().setPlayerName(1, "Renzo");
    actions().setNumSquares(20);
    actions().setBattlesEnabled(false);
    actions().createGame();

    const { game, gameData } = useGameStore.getState();
    expect(game).not.toBeNull();
    expect(game?.getPlayers().map((p) => p.getName())).toEqual([
      "Lucia",
      "Renzo",
    ]);
    expect(game?.getBoard().getSquares()).toHaveLength(20);
    expect(gameData).toEqual(game?.toJSON());
  });

  test("usa il tabellone personalizzato se ha il numero giusto di caselle", () => {
    actions().setPlayerName(0, "Lucia");
    actions().setPlayerName(1, "Renzo");
    actions().setNumSquares(10);
    const custom = Array.from({ length: 10 }, (_, number) => ({
      number,
      type: number === 3 ? ("quiz" as const) : ("normal" as const),
    }));
    actions().setCustomSquares(custom);
    actions().createGame();

    const squares = useGameStore.getState().game?.getBoard().getSquares();
    expect(squares?.map((s) => s.toJSON())).toEqual(custom);
  });
});

describe("persistenza", () => {
  test("i tipi di casella salvati vengono completati con i default", async () => {
    localStorage.setItem(
      "game-config",
      JSON.stringify({
        state: { numSquares: 50, squareTypes: { mime: false } },
        version: 0,
      }),
    );
    await useConfigStore.persist.rehydrate();
    expect(state().numSquares).toBe(50);
    expect(state().squareTypes.mime).toBe(false);
    expect(state().squareTypes.quiz).toBe(true);
    expect(state().squareTypes["dictation-draw"]).toBe(true);
    localStorage.removeItem("game-config");
  });

  test("salva solo la configurazione, non le azioni", () => {
    actions().setNumSquares(33);
    const saved = JSON.parse(localStorage.getItem("game-config") ?? "{}");
    expect(saved.state.numSquares).toBe(33);
    expect(saved.state.actions).toBeUndefined();
  });
});

describe("hook", () => {
  test("espongono stato, azioni e validazione", () => {
    const { result: config } = renderHook(() => useGameConfig());
    const { result: hookActions } = renderHook(() => useConfigActions());
    const { result: validate } = renderHook(() => useConfigValidation());
    expect(config.current.numSquares).toBe(state().numSquares);
    expect(hookActions.current).toBe(state().actions);
    expect(validate.current()).toBe(false);
  });
});

describe("pedine", () => {
  test("predefinite e allineate al numero di giocatori", () => {
    expect(state().playerPawns).toEqual([defaultPawn(0)]);
    actions().setNumPlayers(3);
    expect(state().playerPawns).toEqual([0, 1, 2].map(defaultPawn));
    actions().addPlayer();
    expect(state().playerPawns).toHaveLength(4);
  });

  test("scelta, rimozione di un giocatore e creazione della partita", () => {
    actions().setNumPlayers(3);
    ["Luca", "Anna", "Sara"].forEach((name, i) => {
      actions().setPlayerName(i, name);
    });
    actions().setPlayerPawn(2, { color: "pink", shape: "pill" });
    actions().removePlayer(1);
    expect(state().playerPawns).toEqual([
      defaultPawn(0),
      { color: "pink", shape: "pill" },
    ]);

    actions().createGame();
    const game = useGameStore.getState().game;
    expect(game?.getPlayers().map((p) => [p.getName(), p.getPawn()])).toEqual([
      ["Luca", defaultPawn(0)],
      ["Sara", { color: "pink", shape: "pill" }],
    ]);
  });

  test("setPlayerPawn oltre l'elenco: completa con le predefinite", () => {
    actions().setPlayerPawn(2, { color: "cyan", shape: "hexagon" });
    expect(state().playerPawns).toEqual([
      defaultPawn(0),
      defaultPawn(1),
      { color: "cyan", shape: "hexagon" },
    ]);
  });

  test("configurazione salvata senza pedine: quelle predefinite", async () => {
    localStorage.setItem(
      "game-config",
      JSON.stringify({
        state: { numPlayers: 2, playerNames: ["Luca", "Anna"] },
        version: 0,
      }),
    );
    await useConfigStore.persist.rehydrate();
    expect(state().playerNames).toEqual(["Luca", "Anna"]);
    expect(state().playerPawns).toEqual([defaultPawn(0), defaultPawn(1)]);
    localStorage.removeItem("game-config");
  });
});
