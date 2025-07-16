import { afterAll, describe, expect, test, vi } from "vitest";

vi.mock("@/model/dice", () => {
  const rollMock = vi.fn(() => 1);

  const DiceMock = vi.fn().mockImplementation(function (
    this: { faces: number; roll: () => number },
    faces: number,
  ) {
    this.faces = faces;
    this.roll = rollMock;
  });

  return {
    Dice: DiceMock,
    __esModule: true,
  };
});

import type { Battle } from "@/model/battle";
import { SquaresBuilder } from "@/model/board";
import { Dice } from "@/model/dice";
import { Game } from "@/model/game";
import { MoveSquare, Square } from "@/model/square";

describe("Game with mocked dice", () => {
  afterAll(() => {
    vi.resetAllMocks();
  });

  test("Should always return 1 from mocked Dice", () => {
    const b = new SquaresBuilder().setBoardSize(10).build();
    const game = new Game(b, ["Lucia", "Renzo"]);
    const players = game.getPlayers();

    expect(Dice).toHaveBeenCalledWith(6);

    expect(game.getBoard().getPlayerPosition(players[0])).toBe(0);
    expect(game.getBoard().getPlayerPosition(players[1])).toBe(0);

    game.playTurn();

    expect(game.getBoard().getPlayerPosition(players[0])).toBe(1);
    expect(game.getBoard().getPlayerPosition(players[1])).toBe(0);

    const result1 = game.playTurn();

    expect(game.getBoard().getPlayerPosition(players[0])).toBe(1);
    expect(game.getBoard().getPlayerPosition(players[1])).toBe(1);

    // Verifica che il risultato sia una battaglia
    expect(result1.type).toBe("battle");
    expect(result1.data).toBeDefined();

    game.resolveBattle(result1.data as Battle, players[0]);

    expect(game.getBoard().getPlayerPosition(players[0])).toBe(2);
    expect(game.getBoard().getPlayerPosition(players[1])).toBe(1);

    game.playTurn();

    expect(game.getBoard().getPlayerPosition(players[0])).toBe(3);
    expect(game.getBoard().getPlayerPosition(players[1])).toBe(1);
  });

  test("Test special move square forward", () => {
    const s = [
      new Square(0),
      new MoveSquare(1, 1),
      new Square(2),
      new Square(3),
      new Square(4),
    ];
    const game = new Game(s, ["Lucia", "Renzo"]);
    const players = game.getPlayers();
    expect(Dice).toHaveBeenCalledWith(6);

    expect(game.getBoard().getPlayerPosition(players[0])).toBe(0);
    expect(game.getBoard().getPlayerPosition(players[1])).toBe(0);

    game.playTurn();

    expect(game.getBoard().getPlayerPosition(players[0])).toBe(2);
    expect(game.getBoard().getPlayerPosition(players[1])).toBe(0);

    game.playTurn();

    expect(game.getBoard().getPlayerPosition(players[0])).toBe(2);
    expect(game.getBoard().getPlayerPosition(players[1])).toBe(2);

    game.playTurn();
    game.playTurn();

    expect(game.getBoard().getPlayerPosition(players[0])).toBe(3);
    expect(game.getBoard().getPlayerPosition(players[1])).toBe(3);
  });

  test("Test special move square back", () => {
    const s = [
      new Square(0),
      new MoveSquare(1, -1),
      new Square(2),
      new Square(3),
      new Square(4),
    ];

    const game = new Game(s, ["Lucia", "Renzo"]);
    const players = game.getPlayers();
    expect(Dice).toHaveBeenCalledWith(6);

    expect(game.getBoard().getPlayerPosition(players[0])).toBe(0);
    expect(game.getBoard().getPlayerPosition(players[1])).toBe(0);

    game.playTurn();

    expect(game.getBoard().getPlayerPosition(players[0])).toBe(0);
    expect(game.getBoard().getPlayerPosition(players[1])).toBe(0);

    game.playTurn();

    expect(game.getBoard().getPlayerPosition(players[0])).toBe(0);
    expect(game.getBoard().getPlayerPosition(players[1])).toBe(0);
  });

  test("Test special move squares", () => {
    const s = [
      new Square(0),
      new MoveSquare(1, -1),
      new MoveSquare(2, -1),
      new MoveSquare(3, -1),
      new MoveSquare(4, -1),
    ];

    const game = new Game(s, ["Lucia"]);
    const players = game.getPlayers();

    expect(game.getBoard().getPlayerPosition(players[0])).toBe(0);

    game.playTurn();

    expect(game.getBoard().getPlayerPosition(players[0])).toBe(0);

    game.playTurn();

    expect(game.getBoard().getPlayerPosition(players[0])).toBe(0);
  });

  test("Battle after battle", () => {
    const b = new SquaresBuilder().setBoardSize(10).build();
    const game = new Game(b, ["Lucia", "Renzo", "Samuel"]);
    const players = game.getPlayers();

    expect(game.getBoard().getPlayerPosition(players[0])).toBe(0);
    expect(game.getBoard().getPlayerPosition(players[1])).toBe(0);
    expect(game.getBoard().getPlayerPosition(players[2])).toBe(0);

    game.playTurn();

    expect(game.getBoard().getPlayerPosition(players[0])).toBe(1);
    expect(game.getBoard().getPlayerPosition(players[1])).toBe(0);
    expect(game.getBoard().getPlayerPosition(players[2])).toBe(0);

    const battle1 = game.playTurn();

    expect(game.getBoard().getPlayerPosition(players[0])).toBe(1);
    expect(game.getBoard().getPlayerPosition(players[1])).toBe(1);
    expect(game.getBoard().getPlayerPosition(players[2])).toBe(0);

    // Verifica che il risultato sia una battaglia
    expect(battle1.type).toBe("battle");
    expect(battle1.data).toBeDefined();

    game.resolveBattle(battle1.data as Battle, players[0]);

    expect(game.getBoard().getPlayerPosition(players[0])).toBe(2);
    expect(game.getBoard().getPlayerPosition(players[1])).toBe(1);
    expect(game.getBoard().getPlayerPosition(players[2])).toBe(0);

    const battle2 = game.playTurn();

    expect(game.getBoard().getPlayerPosition(players[0])).toBe(2);
    expect(game.getBoard().getPlayerPosition(players[1])).toBe(1);
    expect(game.getBoard().getPlayerPosition(players[2])).toBe(1);

    const battle3 = game.resolveBattle(battle2.data as Battle, players[2]);
    expect(battle3.type).toBe("battle");
    expect(battle3.data).toBeDefined();
  });
});
