import { Quiz } from "../deck";
import {
  type Command,
  type CommandDependencies,
  SpecialSquare,
} from "./special-square";

/**
 * Special square for the quiz game.
 * When a player lands on this square, they draw a card from the quiz deck.
 */
export class QuizSquare extends SpecialSquare {
  constructor(id: number) {
    super(id);
    this.type = "quiz"; // Specifica il tipo per la serializzazione
  }

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
   * @param dependencies - Object containing the necessary dependencies (player, quizDeck).
   */
  execute(dependencies: CommandDependencies) {
    const quizPlayer = dependencies.player;
    const card = dependencies.quizDeck.draw();
    const quizAction = new Quiz(quizPlayer, card);
    return quizAction;
  }
}
