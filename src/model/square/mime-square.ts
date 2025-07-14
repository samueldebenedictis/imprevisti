import type { GameContext } from "../gameContext";
import { type Command, SpecialSquare } from "./special-square";

export class Mime extends SpecialSquare {
  getCommand(): Command {
    return new MimeCommand();
  }
}

class MimeCommand implements Command {
  execute(context: GameContext): void {
    const _card = context.deck.draw();
  }
}
