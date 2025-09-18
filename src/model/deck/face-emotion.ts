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
  { immagine: "/images/face-emotions/happy.svg", emozione: "felice" },
  { immagine: "/images/face-emotions/sad.svg", emozione: "triste" },
  { immagine: "/images/face-emotions/angry.svg", emozione: "arrabbiato" },
  { immagine: "/images/face-emotions/surprised.svg", emozione: "sorpreso" },
  { immagine: "/images/face-emotions/scared.svg", emozione: "spaventato" },
  { immagine: "/images/face-emotions/disgusted.svg", emozione: "disgustato" },
  { immagine: "/images/face-emotions/excited.svg", emozione: "eccitato" },
  { immagine: "/images/face-emotions/tired.svg", emozione: "stanco" },
  { immagine: "/images/face-emotions/confused.svg", emozione: "confuso" },
  { immagine: "/images/face-emotions/laughing.svg", emozione: "ridere" },
];
