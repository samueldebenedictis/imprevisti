import { describe, expect, test } from "vitest";
import { Board, SquaresBuilder } from "@/model/board";
import { Game } from "@/model/game";
import { Player } from "@/model/player";

describe("Game", () => {
  test("Board", () => {
    const squares = new SquaresBuilder().setBoardSize(10).build();
    const players = ["Renzo", "Lucia"].map((el, i) => new Player(i, el));
    const board = new Board(squares, players);
    const game = new Game(board, players);

    expect(board.getSquares()).toHaveLength(10);

    for (let i = 0; i < 10; i++) {
      expect(game.getBoard().getSquares()[i].getNumber()).toBe(i);
    }
  });

  test("Players", () => {
    const squares = new SquaresBuilder().setBoardSize(10).build();
    const players = ["Renzo", "Lucia"].map((el, i) => new Player(i, el));
    const board = new Board(squares, players);
    const game = new Game(board, players);

    expect(players).toHaveLength(2);

    expect(players[0].getName()).toBe("Renzo");
    expect(game.getBoard().getPlayerPosition(players[0])).toBe(0);
    expect(players[1].getName()).toBe("Lucia");
    expect(game.getBoard().getPlayerPosition(players[1])).toBe(0);
  });

  test("Turns and rounds", () => {
    const squares = new SquaresBuilder().setBoardSize(10).build();
    const players = ["Renzo", "Lucia"].map((el, i) => new Player(i, el));
    const board = new Board(squares, players);
    const game = new Game(board, players);

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
    const squares = new SquaresBuilder().setBoardSize(1).build();
    const players = ["Renzo", "Lucia"].map((el, i) => new Player(i, el));
    const board = new Board(squares, players);
    const game = new Game(board, players);

    game.playTurn();

    expect(game.getBoard().getPlayerPosition(players[0])).toBe(1);
  });

  test("If game ended players don't move", () => {
    const squares = new SquaresBuilder().setBoardSize(1).build();
    const players = ["Renzo", "Lucia"].map((el, i) => new Player(i, el));
    const board = new Board(squares, players);
    const game = new Game(board, players);

    game.playTurn();
    expect(game.getBoard().getPlayerPosition(players[0])).toBe(1);

    expect(() => game.playTurn()).toThrow();
    expect(game.getBoard().getPlayerPosition(players[0])).toBe(1);
    expect(game.getBoard().getPlayerPosition(players[1])).toBe(0);
    expect(game.getWinner()?.getName()).toBe("Renzo");
    expect(game.isGameEnded()).toBeTruthy();
  });

  test("Skip turn", () => {
    const squares = new SquaresBuilder().setBoardSize(10).build();
    const players = ["Renzo", "Lucia"].map((el, i) => new Player(i, el));
    const board = new Board(squares, players);
    const game = new Game(board, players);

    players[0].skipNextTurn();
    game.playTurn();
    expect(game.getBoard().getPlayerPosition(players[0])).toBe(0);

    game.playTurn();
    expect(game.getBoard().getPlayerPosition(players[0])).toBe(0);
    expect(game.getBoard().getPlayerPosition(players[1])).toBeGreaterThan(0);
  });
});
