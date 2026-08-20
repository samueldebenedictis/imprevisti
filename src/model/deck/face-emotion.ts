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

/**
 * Soggetti del dataset FACES (Ebner, Riediger & Lindenberger) usati per le carte.
 * Codice file: {id}_{eta}_{genere}_{emozione}_{versione}.jpg
 */
const faceEmotionSubjects = [
  { id: "004", code: "o_m", title: "uomo-anziano" },
  { id: "066", code: "y_m", title: "uomo-giovane" },
  { id: "079", code: "o_f", title: "donna-anziana" },
  { id: "116", code: "m_m", title: "uomo-adulto" },
  { id: "140", code: "y_f", title: "donna-giovane" },
  { id: "168", code: "m_f", title: "donna-adulta" },
];

const faceEmotionLabels = [
  { code: "h", emotion: "felicità" },
  { code: "a", emotion: "rabbia" },
  { code: "s", emotion: "tristezza" },
  { code: "d", emotion: "disgusto" },
  { code: "f", emotion: "paura" },
  { code: "n", emotion: "neutralità" },
];

const faceEmotionVersions = ["a", "b"];

export const faceEmotionCards = faceEmotionSubjects.flatMap((subject) =>
  faceEmotionLabels.flatMap(({ code: emotionCode, emotion }) =>
    faceEmotionVersions.map((version) => ({
      title: `${subject.title}-${emotion}-${version}`,
      imageUrl: `/images/faces/${subject.id}_${subject.code}_${emotionCode}_${version}.jpg`,
      emotion,
    })),
  ),
);
