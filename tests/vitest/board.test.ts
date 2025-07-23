import { describe, expect, test } from "vitest";
import { Board, SquaresBuilder } from "@/model/board";
import { Player } from "@/model/player";
import { Square } from "@/model/square/square";

describe("Board", () => {
  test("Build from size", () => {
    const size = 10;
    const squares = new SquaresBuilder().setBoardSize(size).build();
    const board = new Board(squares, [new Player(0, "Lucia")]);
    expect(board.getSquares()).toHaveLength(10);
  });

  test("Build with squares", () => {
    const squares = [new Square(0), new Square(1)];
    const board = new Board(squares, [new Player(0, "Lucia")]);
    expect(board.getSquares()).toHaveLength(2);
  });

  test("Failed build from size", () => {
    const _squares = [new Square(0), new Square(1)];
    const board = () => new SquaresBuilder().build();
    expect(board).toThrow();
  });
});
