import type { GameContext } from "../gameContext.js";

export class Square {
  private number: number;

  constructor(id: number) {
    this.number = id;
  }

  getNumber = () => this.number;
}

export interface Command {
  execute(context: GameContext): void;
}

export abstract class SpecialSquare extends Square {
  abstract getCommand(): Command;
}

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

export class GoToStart extends MoveSquare {
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

export class ChanceSquare extends SpecialSquare {
  getCommand(): Command {
    throw new Error("Method not implemented.");
  }
}
