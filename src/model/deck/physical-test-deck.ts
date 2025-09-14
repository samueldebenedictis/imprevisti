import { Card } from "./card";
import { Deck } from "./deck";
import { physicalTestCards } from "./physical-test";

export class PhysicalTestDeck extends Deck {
  constructor(cards: Card[] = physicalTestCards.map((el) => new Card(el, ""))) {
    super(cards);
  }
}
