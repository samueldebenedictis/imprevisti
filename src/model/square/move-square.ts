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
    const currentPosition = context.board.getPlayerPosition(
      context.player,
    ) as number;
    const newPosition = currentPosition + this.moveValue;

    // Use the game's movePlayer method to ensure collision detection
    // Note: We need to access the game instance through the context
    // For now, we'll use the board directly but this should be refactored
    context.board.movePlayer(context.player, newPosition);
  }
}
