import type { Player } from "../player";
import type { Card } from "./card";

/**
 * Represents a face emotion action in the game.
 * It holds the player who has to guess the emotion and the card with the emotion image.
 */
export class FaceEmotion {
  /**
   * Creates a new instance of FaceEmotion.
   * @param emotionPlayer - The player who has to guess the emotion.
   * @param cardEmotion - The card containing the emotion image and correct answer.
   * @param imageUrl - The URL of the emotion image.
   */
  constructor(
    public emotionPlayer: Player,
    public cardEmotion: Card,
    public imageUrl: string,
  ) {}
}

export const faceEmotionCards = [
  {
    title: "adulto-felice",
    image: "/images/face-emotion/adulto-felice.jpeg",
    emotion: "felice",
  },
];
