import { Card } from "./card";
import { Deck } from "./deck";
import { emotionVideoCards } from "./emotion-video";

export class EmotionVideoDeck extends Deck {
  constructor(
    cards: Card[] = emotionVideoCards.map(
      (el) => new Card(el.emotion, el.title),
    ),
  ) {
    super(cards);
  }

  /**
   * Gets the video data for a specific card.
   * @param card - The card to get video data for
   * @returns The video data object or undefined if not found
   */
  getVideoData(card: Card) {
    const cardText = card.cardText;
    return emotionVideoCards.find((el) => el.title === cardText);
  }
}
