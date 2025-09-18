import { Card } from "./card";
import { Deck } from "./deck";
import { faceEmotionCards } from "./face-emotion";

export class FaceEmotionDeck extends Deck {
  constructor(
    cards: Card[] = faceEmotionCards.map((el) => new Card(el.emozione, "")),
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
    return faceEmotionCards.find((emotion) => emotion.emozione === cardText);
  }
}
