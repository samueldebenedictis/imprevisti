import { Card } from "./card";
import { Deck } from "./deck";
import { faceEmotionCards } from "./face-emotion";

export class FaceEmotionDeck extends Deck {
  constructor(
    cards: Card[] = faceEmotionCards.map(
      (el) => new Card(el.emotion, el.title),
    ),
  ) {
    super(cards);
  }

  /**
   * Gets the image data for a specific card.
   * @param card - The card to get image data for
   * @returns The image data object or undefined if not found
   */
  getImageData(card: Card) {
    const cardText = card.cardText;
    return faceEmotionCards.find((el) => el.title === cardText);
  }
}
