import type { GameContext } from "../gameContext";
import { Square } from "./square";

export interface Command {
  execute(context: GameContext): void;
}

export abstract class SpecialSquare extends Square {
  abstract getCommand(): Command;
}
