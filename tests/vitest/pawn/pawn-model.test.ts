import { describe, expect, test } from "vitest";
import { validateGameJSON } from "@/lib/game-json";
import { Board } from "@/model/board";
import { Game } from "@/model/game";
import {
  defaultPawn,
  isPawnStyle,
  PAWN_COLORS,
  PAWN_SHAPES,
  pawnOrDefault,
} from "@/model/pawn";
import { Player } from "@/model/player";
import { Square } from "@/model/square/square";

const makeGame = (players: Player[]) =>
  new Game(
    new Board(
      Array.from({ length: 10 }, (_, i) => new Square(i)),
      players,
    ),
  );

describe("pedina predefinita", () => {
  test("deterministica: stesso indice, stessa pedina", () => {
    expect(defaultPawn(2)).toEqual(defaultPawn(2));
    expect(defaultPawn(0)).toEqual({ color: PAWN_COLORS[0], shape: "square" });
  });

  test("colori diversi per i primi giocatori, poi si ricomincia", () => {
    const colors = PAWN_COLORS.map((_, i) => defaultPawn(i).color);
    expect(new Set(colors).size).toBe(PAWN_COLORS.length);
    expect(defaultPawn(PAWN_COLORS.length)).toEqual(defaultPawn(0));
  });

  test("ordine cromatico, dal rosso al rosa", () => {
    expect(PAWN_COLORS).toEqual([
      "red",
      "orange",
      "yellow",
      "green",
      "cyan",
      "blue",
      "purple",
      "pink",
    ]);
  });

  test("indici strani: nessun errore", () => {
    for (const i of [-1, 2.7, Number.NaN])
      expect(PAWN_COLORS).toContain(defaultPawn(i).color);
  });
});

describe("validazione", () => {
  test("isPawnStyle accetta solo colori e forme ammessi", () => {
    for (const shape of PAWN_SHAPES)
      expect(isPawnStyle({ color: "red", shape })).toBe(true);
    for (const value of [
      null,
      "red",
      {},
      { color: "black", shape: "square" },
      { color: "red", shape: "circle" },
      { color: "red" },
    ])
      expect(isPawnStyle(value)).toBe(false);
  });

  test("pawnOrDefault: la pedina valida, ripulita da altri campi", () => {
    expect(
      pawnOrDefault({ color: "pink", shape: "hexagon", extra: 1 }, 3),
    ).toEqual({ color: "pink", shape: "hexagon" });
    expect(pawnOrDefault({ color: "x" }, 3)).toEqual(defaultPawn(3));
    expect(pawnOrDefault(undefined, 1)).toEqual(defaultPawn(1));
  });
});

describe("giocatore e partita", () => {
  test("Player senza pedina: quella predefinita per l'id", () => {
    expect(new Player(4, "Anna").getPawn()).toEqual(defaultPawn(4));
    const pawn = { color: "orange", shape: "pill" } as const;
    expect(new Player(0, "Luca", pawn).getPawn()).toEqual(pawn);
  });

  test("la pedina sopravvive a salvataggio e caricamento", () => {
    const game = makeGame([
      new Player(0, "Luca", { color: "pink", shape: "hexagon" }),
      new Player(1, "Anna", { color: "green", shape: "parallelogram" }),
    ]);
    const json = game.toJSON();
    expect(json.players[0].pawn).toEqual({ color: "pink", shape: "hexagon" });
    const loaded = Game.fromJSON(json);
    expect(loaded.getPlayers().map((p) => p.getPawn())).toEqual([
      { color: "pink", shape: "hexagon" },
      { color: "green", shape: "parallelogram" },
    ]);
  });

  test("salvataggio precedente alle pedine: quelle predefinite", () => {
    const json = makeGame([
      new Player(0, "Luca"),
      new Player(1, "Anna"),
    ]).toJSON();
    for (const p of json.players) delete p.pawn;
    expect(validateGameJSON(json)).toBeNull();
    const loaded = Game.fromJSON(json);
    expect(loaded.getPlayers().map((p) => p.getPawn())).toEqual([
      defaultPawn(0),
      defaultPawn(1),
    ]);
  });

  test("pedina non valida nel salvataggio: rifiutato", () => {
    const json = makeGame([
      new Player(0, "Luca"),
      new Player(1, "Anna"),
    ]).toJSON();
    (json.players[0] as { pawn: unknown }).pawn = {
      color: "black",
      shape: "square",
    };
    expect(validateGameJSON(json)).toBe("giocatore non valido");
  });
});
