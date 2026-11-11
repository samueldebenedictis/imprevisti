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

/** Le fotografie FACES sono servite dal Route Handler /api/faces/[file]. */
export const FACES_API_PREFIX = "/api/faces/";

export const facesImageUrl = (file: string) => `${FACES_API_PREFIX}${file}`;

/** Immagine senza volti per Storybook e per i test. */
const FACE_PLACEHOLDER_URL = "/images/face-placeholder.svg";

const buildFaceEmotionCards = (
  labels: typeof faceEmotionLabels,
  toImageUrl: (file: string) => string,
) =>
  faceEmotionSubjects.flatMap((subject) =>
    labels.flatMap(({ code: emotionCode, emotion }) =>
      faceEmotionVersions.map((version) => {
        const file = `${subject.id}_${subject.code}_${emotionCode}_${version}.jpg`;
        return {
          title: `${subject.title}-${emotion}-${version}`,
          /** Nome del file FACES nell'archivio privato. */
          file,
          imageUrl: toImageUrl(file),
          emotion,
        };
      }),
    ),
  );

/** Carte usate in partita: neutralità esclusa (troppo ambigua da indovinare). */
export const faceEmotionCards = buildFaceEmotionCards(
  faceEmotionLabels.filter((label) => label.code !== "n"),
  facesImageUrl,
);

/** Nomi dei file FACES che il Route Handler può restituire. */
export const faceEmotionFiles: ReadonlySet<string> = new Set(
  faceEmotionCards.map((card) => card.file),
);

/** Set completo (neutralità inclusa) per Storybook. */
export const faceEmotionStorybookCards = buildFaceEmotionCards(
  faceEmotionLabels,
  () => FACE_PLACEHOLDER_URL,
);
