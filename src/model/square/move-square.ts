import type { GameContext } from "../gameContext";
import { type Command, SpecialSquare } from "./special-square";

export class MoveSquare extends SpecialSquare {
  moveValue: number;
  constructor(id: number, moveValue: number) {
    super(id);
    this.moveValue = moveValue;
  }
  getValue() {
    return this.moveValue;
  }
  getCommand(): Command {
    return new MovePlayerCommand(this.moveValue);
  }
}

export class GoToStartSquare extends MoveSquare {
  constructor(id: number) {
    super(id, -id);
  }
}

class MovePlayerCommand implements Command {
  constructor(private moveValue: number) {}

  execute(context: GameContext): void {
    const newPosition =
      (context.board.getPlayerPosition(context.player) as number) +
      this.moveValue;
    context.board.movePlayer(context.player, newPosition);
  }
}
