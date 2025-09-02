import { Card } from "./card";
import { Deck } from "./deck";
import { mimeCards } from "./mime";

export class MimeDeck extends Deck {
  constructor(cards: Card[] = mimeCards.map((el) => new Card(el, ""))) {
    super(cards);
  }
}
