import { type Command, SpecialSquare } from "./special-square";

export class ChanceSquare extends SpecialSquare {
  getCommand(): Command {
    throw new Error("Method not implemented.");
  }
}
