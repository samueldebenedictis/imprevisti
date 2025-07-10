import type { Player } from "./player";
import { Square } from "./square";

export type BoardT = InstanceType<typeof Board>;

class Board {
  private squares: { square: Square; playersOn: Player[] }[];

  constructor(board: Square[]) {
    this.squares = board.map((square) => ({ square, playersOn: [] }));
  }

  getSquares = () => this.squares.map((el) => el.square);
}

export class BoardBuilder {
  private board: Square[] | undefined;
  private boardSize: number | undefined;

  setBoard = (squareArray: Square[]) => {
    this.board = squareArray;
    return this;
  };

  setBoardSize = (size: number) => {
    this.boardSize = size;
    return this;
  };

  buildWithSpecificBoard() {
    if (this.board === undefined) {
      throw new Error("Board not defined");
    }
    return new Board(this.board);
  }

  buildWithSize() {
    if (this.boardSize === undefined) {
      throw new Error("Size not defined");
    }
    const squaresNumbers = Array.from(
      { length: this.boardSize },
      (_, i) => i + 1,
    );
    const b = squaresNumbers.map((n) => new Square(n));
    return new Board(b);
  }
}
