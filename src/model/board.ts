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
  getPlayerPosition = (player: Player) =>
    this.playersPosition.get(player) as number;
  movePlayer = (player: Player, position: number) => {
    this.playersPosition.set(player, position);
  };
  
  /**
   * Returns all players currently on the specified square position.
   */
  getPlayersOnSquare = (position: number): Player[] => {
    return Array.from(this.playersPosition.entries())
      .filter(([player, pos]) => pos === position)
      .map(([player, pos]) => player);
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
