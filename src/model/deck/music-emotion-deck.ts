import { Card } from "./card";
import { Deck } from "./deck";
import { musicEmotionCards } from "./music-emotion";

export class MusicEmotionDeck extends Deck {
  constructor(cards: Card[] = musicEmotionCards.map((el) => new Card(el, ""))) {
    super(cards);
  }
}
