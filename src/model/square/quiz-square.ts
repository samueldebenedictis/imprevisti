import { Quiz } from "../deck";
import type { GameContext } from "../gameContext";
import { type Command, SpecialSquare } from "./special-square";

/**
 * Special square for the quiz game.
 * When a player lands on this square, they draw a card from the quiz deck.
 */
export class QuizSquare extends SpecialSquare {
  /**
   * Returns the command to execute the quiz action.
   * @returns Command that handles the quiz logic.
   */
  getCommand(): Command {
    return new QuizCommand();
  }
}

/**
 * Command that implements the quiz game logic.
 */
class QuizCommand implements Command {
  /**
   * Executes the quiz action.
   * The player who lands on the square must answer a quiz question.
   * If the answer is correct, the player advances one square.
   * Otherwise, the player who answered skips the next turn.
   * @param context - Game context containing the current player, the quiz deck, and the game instance.
   */
  execute(context: GameContext) {
    const quizPlayer = context.player;
    const card = context.quizDeck.draw();
    const quizAction = new Quiz(quizPlayer, card);
    return quizAction;
  }
}
