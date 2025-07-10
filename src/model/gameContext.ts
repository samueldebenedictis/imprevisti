import type { BoardT } from "./board";
import type { Deck } from "./deck";
import type { Dice } from "./dice";
import type { Player } from "./player";

export class GameContext {
  constructor(
    public player: Player,
    public board: BoardT,
    public players: Player[],
    public deck: Deck,
    public dice: Dice,
  ) {}
}
