import { describe, expect, test } from "vitest";
import { SquaresBuilder } from "@/model/board";
import { Game } from "@/model/game";

describe("Game", () => {
  test("Board", () => {
    const b = new SquaresBuilder().setBoardSize(10).build();
    const game = new Game(b, ["Renzo", "Lucia"]);
    const board = game.getBoard();
    expect(board.getSquares()).toHaveLength(10);

    for (let i = 0; i < 10; i++) {
      expect(game.getBoard().getSquares()[i].getNumber()).toBe(i);
    }
  });

  test("Players", () => {
    const b = new SquaresBuilder().setBoardSize(10).build();
    const game = new Game(b, ["Renzo", "Lucia"]);
    const players = game.getPlayers();
    expect(players).toHaveLength(2);

    expect(players[0].getName()).toBe("Renzo");
    expect(game.getBoard().getPlayerPosition(players[0])).toBe(0);
    expect(players[1].getName()).toBe("Lucia");
    expect(game.getBoard().getPlayerPosition(players[1])).toBe(0);
  });

  test("Turns and rounds", () => {
    const b = new SquaresBuilder().setBoardSize(10).build();
    const game = new Game(b, ["Renzo", "Lucia"]);
    const players = game.getPlayers();

    expect(game.getTurn()).toBe(0);
    expect(game.getRound()).toBe(1);

    game.playTurn();

    expect(game.getBoard().getPlayerPosition(players[0])).not.toBe(0);
    expect(game.getTurn()).toBe(1);
    expect(game.getRound()).toBe(1);

    game.playTurn();

    expect(game.getTurn()).toBe(0);
    expect(game.getRound()).toBe(2);
  });

  test("Max position", () => {
    const b = new SquaresBuilder().setBoardSize(1).build();
    const game = new Game(b, ["Renzo", "Lucia"]);

    game.playTurn();
    const players = game.getPlayers();
    expect(game.getBoard().getPlayerPosition(players[0])).toBe(1);
  });

  test("If game ended players don't move", () => {
    const b = new SquaresBuilder().setBoardSize(1).build();
    const game = new Game(b, ["Renzo", "Lucia"]);
    const players = game.getPlayers();

    game.playTurn();
    expect(game.getBoard().getPlayerPosition(players[0])).toBe(1);

    expect(() => game.playTurn()).toThrow();
    expect(game.getBoard().getPlayerPosition(players[0])).toBe(1);
    expect(game.getBoard().getPlayerPosition(players[1])).toBe(0);
    expect(game.getWinner()?.getName()).toBe("Renzo");
  });
});
