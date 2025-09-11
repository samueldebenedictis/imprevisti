import { describe, expect, test } from "vitest";
import { Board } from "@/model/board";
import { Game } from "@/model/game";
import { Player } from "@/model/player";
import { Square } from "@/model/square";

const getSquares = (n: number) =>
  Array.from(Array(n).keys()).map((_, i) => new Square(i));

describe("Game", () => {
  test("Board", () => {
    const squares = getSquares(10);
    const players = ["Renzo", "Lucia"].map((el, i) => new Player(i, el));
    const board = new Board(squares, players);
    const game = new Game(board);

    expect(board.getSquares()).toHaveLength(10);

    for (let i = 0; i < 10; i++) {
      expect(game.getBoard().getSquares()[i].getNumber()).toBe(i);
    }
  });

  test("Players", () => {
    const squares = getSquares(10);
    const players = ["Renzo", "Lucia"].map((el, i) => new Player(i, el));
    const board = new Board(squares, players);
    const game = new Game(board);

    expect(players).toHaveLength(2);

    expect(players[0].getName()).toBe("Renzo");
    expect(game.getBoard().getPlayerPosition(players[0])).toBe(0);
    expect(players[1].getName()).toBe("Lucia");
    expect(game.getBoard().getPlayerPosition(players[1])).toBe(0);
  });

  test("Turns and rounds", () => {
    const squares = getSquares(10);
    const players = ["Renzo", "Lucia"].map((el, i) => new Player(i, el));
    const board = new Board(squares, players);
    const game = new Game(board);

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
    const squares = getSquares(2);
    const players = ["Renzo", "Lucia"].map((el, i) => new Player(i, el));
    const board = new Board(squares, players);
    const game = new Game(board);

    game.playTurn();

    expect(game.getBoard().getPlayerPosition(players[0])).toBe(1);
  });

  test("If game ended players don't move", () => {
    const squares = getSquares(2);
    const players = ["Renzo", "Lucia"].map((el, i) => new Player(i, el));
    const board = new Board(squares, players);
    const game = new Game(board);

    game.playTurn();
    expect(game.getBoard().getPlayerPosition(players[0])).toBe(1);

    expect(() => game.playTurn()).toThrow();
    expect(game.getBoard().getPlayerPosition(players[0])).toBe(1);
    expect(game.getBoard().getPlayerPosition(players[1])).toBe(0);
    expect(game.getWinner()?.getName()).toBe("Renzo");
    expect(game.isGameEnded()).toBeTruthy();
  });

  test("Skip turn", () => {
    const squares = getSquares(10);
    const players = ["Renzo", "Lucia"].map((el, i) => new Player(i, el));
    const board = new Board(squares, players);
    const game = new Game(board);

    players[0].skipNextTurn();
    game.playTurn();
    expect(game.getBoard().getPlayerPosition(players[0])).toBe(0);

    game.playTurn();
    expect(game.getBoard().getPlayerPosition(players[0])).toBe(0);
    expect(game.getBoard().getPlayerPosition(players[1])).toBeGreaterThan(0);
  });

  test("Game fromJSON", () => {
    const squares = getSquares(5);
    const players = ["Renzo", "Lucia"].map((el, i) => new Player(i, el));
    const board = new Board(squares, players);
    const originalGame = new Game(board);

    // Move a player
    originalGame.playTurn();
    const json = originalGame.toJSON();

    // Reconstruct from JSON
    const reconstructedGame = Game.fromJSON(json);

    expect(reconstructedGame.getTurn()).toBe(originalGame.getTurn());
    expect(reconstructedGame.getRound()).toBe(originalGame.getRound());
    expect(reconstructedGame.getPlayers().length).toBe(2);
    expect(
      reconstructedGame.getPlayerPosition(reconstructedGame.getPlayers()[0]),
    ).toBe(originalGame.getPlayerPosition(originalGame.getPlayers()[0]));
  });
});
