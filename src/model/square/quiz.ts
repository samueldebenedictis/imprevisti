import type { Card } from "../card";
import type { Player } from "../player";

/**
 * Represents a quiz action in the game.
 * It holds the player who has to answer the quiz and the card with the question.
 */
export class Quiz {
  /**
   * Creates a new instance of Quiz.
   * @param quizPlayer - The player who has to answer the quiz.
   * @param cardTopic - The card containing the quiz question.
   */
  constructor(
    public quizPlayer: Player,
    public cardTopic: Card,
  ) {}
}
