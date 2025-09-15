import { DictationDraw } from "../deck";
import {
  type Command,
  type CommandDependencies,
  SpecialSquare,
} from "./special-square";

/**
 * Special square for the dictation draw game.
 * When a player lands on this square, they draw a card from the deck.
 */
export class DictationDrawSquare extends SpecialSquare {
  constructor(id: number) {
    super(id);
    this.type = "dictation-draw"; // Specify the type for serialization
  }

  /**
   * Returns the command to execute the dictation draw action.
   * @returns Command that handles the dictation draw logic
   */
  getCommand(): Command {
    return new DictationDrawCommand();
  }
}

/**
 * Command that implements the dictation draw game logic.
 */
class DictationDrawCommand implements Command {
  /**
   * Executes the dictation draw action.
   * The player who lands on the square must describe an image to another player.
   * If the drawing is similar, both players advance one square.
   * Otherwise, the player who described skips the next turn.
   * @param dependencies - Object containing necessary dependencies (player, dictationDrawDeck).
   */
  execute(dependencies: CommandDependencies) {
    const drawingPlayer = dependencies.player;
    const card = dependencies.dictationDrawDeck.draw();
    // Get the image URL from the card topic
    const imageData = dependencies.dictationDrawDeck.getImageData(card);
    const dictationDrawAction = new DictationDraw(
      drawingPlayer,
      card,
      imageData?.imageUrl || "",
    );
    return dictationDrawAction;
  }
}
