import type { Player } from "./player";
import { Square } from "./square";

export class Board {
  private squares: Square[];
  private playersPosition: Map<Player, number>;

  constructor(squares: Square[], players: Player[]) {
    this.squares = squares;
    this.playersPosition = new Map(players.map((p) => [p, 0]));
  }

  getSquares = () => this.squares;
  getPlayerPosition = (player: Player) => this.playersPosition.get(player);
  movePlayer = (player: Player, position: number) => {
    this.playersPosition.set(player, position);
  };
}

export class SquaresBuilder {
  private squares: Square[] | undefined;
  private boardSize: number | undefined;

  setBoardSize = (size: number) => {
    this.boardSize = size;
    return this;
  };

  build() {
    if (this.boardSize === undefined) {
      throw new Error("Size not defined");
    }
    const squaresNumbers = Array.from({ length: this.boardSize }, (_, i) => i);
    this.squares = squaresNumbers.map((n) => new Square(n));
    return this.squares;
  }
}
