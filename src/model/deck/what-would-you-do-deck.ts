import { Card } from "./card";
import { Deck } from "./deck";
import { whatWouldYouDoCards } from "./what-would-you-do";

export class WhatWouldYouDoDeck extends Deck {
  constructor(
    cards: Card[] = whatWouldYouDoCards.map((el) => new Card(el, "")),
  ) {
    super(cards);
  }
}
