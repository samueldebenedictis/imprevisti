import { Card } from "./card";
import { Deck } from "./deck";
import { dictationDrawCards, dictationDrawImages } from "./dictation-draw";

export class DictationDrawDeck extends Deck {
  constructor(
    cards: Card[] = dictationDrawCards.map((el) => new Card(el, "")),
  ) {
    super(cards);
  }

  /**
   * Gets the image data for a specific card.
   * @param card - The card to get image data for
   * @returns The image data object or undefined if not found
   */
  getImageData(card: Card) {
    const cardText = card.cardTitle;
    return dictationDrawImages.find((image) => cardText.includes(image.name));
  }
}
