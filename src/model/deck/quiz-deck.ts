import { Card } from "./card";
import { Deck } from "./deck";
import { quizCards } from "./quiz";

export class QuizDeck extends Deck {
  constructor(
    cards: Card[] = quizCards.map((el) => new Card(el.domanda, el.risposta)),
  ) {
    super(cards);
  }
}
