import { Card } from "./card";
import { Deck } from "./deck";
import { type FaceSet, faceEmotionCardsFor } from "./face-emotion";

export class FaceEmotionDeck extends Deck {
  private readonly imageCards: ReturnType<typeof faceEmotionCardsFor>;

  /**
   * @param faceSet - Volti del mazzo: fotografie FACES o volti illustrati
   * @param cards - Carte del mazzo (default: tutte quelle del set di volti)
   */
  constructor(
    faceSet: FaceSet = "ai",
    cards: Card[] = faceEmotionCardsFor(faceSet).map(
      (el) => new Card(el.emotion, el.title),
    ),
  ) {
    super(cards);
    this.imageCards = faceEmotionCardsFor(faceSet);
  }

  /**
   * Gets the image data for a specific card.
   * @param card - The card to get image data for
   * @returns The image data object or undefined if not found
   */
  getImageData(card: Card) {
    const cardText = card.cardText;
    return this.imageCards.find((el) => el.title === cardText);
  }
}
