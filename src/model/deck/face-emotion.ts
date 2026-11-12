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
export const faceEmotionSubjects = [
  { id: "004", code: "o_m", title: "uomo-anziano" },
  { id: "066", code: "y_m", title: "uomo-giovane" },
  { id: "079", code: "o_f", title: "donna-anziana" },
  { id: "116", code: "m_m", title: "uomo-adulto" },
  { id: "140", code: "y_f", title: "donna-giovane" },
  { id: "168", code: "m_f", title: "donna-adulta" },
];

export const faceEmotionLabels = [
  { code: "h", emotion: "felicità" },
  { code: "a", emotion: "rabbia" },
  { code: "s", emotion: "tristezza" },
  { code: "d", emotion: "disgusto" },
  { code: "f", emotion: "paura" },
  { code: "n", emotion: "neutralità" },
];

const faceEmotionVersions = ["a", "b"];

/** Fotografie e clip FACES sono servite dal Route Handler /api/faces/[file]. */
export const FACES_API_PREFIX = "/api/faces/";

export const facesImageUrl = (file: string) => `${FACES_API_PREFIX}${file}`;

/** Emozioni giocabili (neutralità esclusa, troppo ambigua da indovinare). */
export const playableFaceEmotionLabels = faceEmotionLabels.filter(
  (label) => label.code !== "n",
);

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
  playableFaceEmotionLabels,
  facesImageUrl,
);

/** Nomi dei file FACES che il Route Handler può restituire. */
export const faceEmotionFiles: ReadonlySet<string> = new Set(
  faceEmotionCards.map((card) => card.file),
);

/**
 * Volti illustrati (generati con l'IA per il progetto, non da FACES): usati
 * quando la partita non ha un codice d'accesso alle fotografie FACES o il
 * disclaimer non è stato accettato. Sono file pubblici.
 */
const aiFaceSubjects = [
  "anziano",
  "bambina",
  "bambino",
  "donna",
  "uomo-1",
  "uomo-2",
];

const aiFaceLabels = [
  { code: "felice", emotion: "felicità" },
  { code: "arrabbiato", emotion: "rabbia" },
  { code: "triste", emotion: "tristezza" },
  { code: "sorpreso", emotion: "sorpresa" },
  { code: "spaventato", emotion: "paura" },
  { code: "stanco", emotion: "stanchezza" },
];

export const aiFaceEmotionCards = aiFaceSubjects.flatMap((subject) =>
  aiFaceLabels.map(({ code, emotion }) => ({
    title: `${subject}-${code}`,
    imageUrl: `/images/face-emotion/${subject}-${code}.jpg`,
    emotion,
  })),
);

/**
 * Volti usati da una partita: fotografie FACES (solo con codice d'accesso e
 * disclaimer accettato) oppure volti illustrati.
 */
export type FaceSet = "faces" | "ai";

export const FACE_SETS: readonly FaceSet[] = ["faces", "ai"];

/** Carte di "Indovina l'emozione" per il set di volti indicato. */
export const faceEmotionCardsFor = (
  faceSet: FaceSet,
): readonly { title: string; imageUrl: string; emotion: string }[] =>
  faceSet === "faces" ? faceEmotionCards : aiFaceEmotionCards;

/** Set completo (neutralità inclusa) per Storybook. */
export const faceEmotionStorybookCards = buildFaceEmotionCards(
  faceEmotionLabels,
  () => FACE_PLACEHOLDER_URL,
);
