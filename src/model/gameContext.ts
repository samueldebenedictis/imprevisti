import type { Board } from "./board";
import type { Deck } from "./deck";
import type { Dice } from "./dice";
import type { Player } from "./player";

export class GameContext {
  constructor(
    public player: Player,
    public board: Board,
    public players: Player[],
    public deck: Deck,
    public dice: Dice,
  ) {}
}
