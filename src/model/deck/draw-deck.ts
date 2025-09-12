import { Card } from "./card";
import { Deck } from "./deck";
import { drawCards } from "./draw";

export class DrawDeck extends Deck {
  constructor(cards: Card[] = drawCards.map((el) => new Card(el, ""))) {
    super(cards);
  }
}
