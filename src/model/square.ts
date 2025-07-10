import type { Game } from "./game";
import type { Player } from "./player";

export class Square {
  private id: number;

  constructor(id: number) {
    this.id = id;
  }

  getId = () => this.id;
  getNumber = () => this.id + 1;
}

export interface Command {
  execute(game: Game, player: Player): void;
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

class MovePlayerCommand implements Command {
  constructor(private moveValue: number) {}

  execute(game: Game, player: Player): void {
    const newPosition = player.getPosition() + this.moveValue;
    game.movePlayer(newPosition, player);
  }
}

export class ChanceSquare extends SpecialSquare {
  getCommand(): Command {
    throw new Error("Method not implemented.");
  }
}

export class GoToStart extends MoveSquare {
  constructor(id: number) {
    super(id, -id);
  }
}
