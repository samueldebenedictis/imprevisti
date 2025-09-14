import { backWriteCards } from "./backwrite";
import { Card } from "./card";
import { Deck } from "./deck";

export class BackWriteDeck extends Deck {
  constructor(cards: Card[] = backWriteCards.map((el) => new Card(el, ""))) {
    super(cards);
  }
}
