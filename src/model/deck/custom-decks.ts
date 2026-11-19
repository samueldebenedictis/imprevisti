import { backWriteCards } from "./backwrite";
import { mimeCards } from "./mime";
import { musicEmotionCards } from "./music-emotion";
import { physicalTestCards } from "./physical-test";
import { quizCards } from "./quiz";
import { whatWouldYouDoCards } from "./what-would-you-do";

/**
 * Mazzi che il docente può personalizzare: quiz (domanda e risposta) e i mazzi
 * di sole frasi o parole. Restano fuori quelli legati a immagini e video.
 */
export const EDITABLE_DECK_IDS = [
  "quiz",
  "whatWouldYouDo",
  "mime",
  "backWrite",
  "musicEmotion",
  "physicalTest",
] as const;
export type EditableDeckId = (typeof EDITABLE_DECK_IDS)[number];

export interface QuizCardData {
  domanda: string;
  risposta: string;
}

/**
 * Carte personalizzate, per mazzo. Un mazzo assente usa le carte
 * predefinite; uno presente le sostituisce del tutto.
 */
export interface CustomDecks {
  quiz?: QuizCardData[];
  whatWouldYouDo?: string[];
  mime?: string[];
  backWrite?: string[];
  musicEmotion?: string[];
  physicalTest?: string[];
}

export const MAX_CUSTOM_CARDS = 200;
export const MAX_CARD_TEXT = 200;

/** Le carte predefinite di ogni mazzo personalizzabile. */
export const defaultDeckCards = (): Required<CustomDecks> => ({
  quiz: quizCards.map(({ domanda, risposta }) => ({ domanda, risposta })),
  whatWouldYouDo: [...whatWouldYouDoCards],
  mime: [...mimeCards],
  backWrite: [...backWriteCards],
  musicEmotion: [...musicEmotionCards],
  physicalTest: [...physicalTestCards],
});

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const isText = (v: unknown): v is string =>
  typeof v === "string" &&
  v.trim().length > 0 &&
  v.trim().length <= MAX_CARD_TEXT;

/**
 * Controlla le carte personalizzate (dal server a /start, o dentro un
 * salvataggio). Ogni mazzo presente deve avere da 1 a MAX_CUSTOM_CARDS
 * carte, ciascuna con testo non vuoto di al più MAX_CARD_TEXT caratteri.
 * @returns null se valide, altrimenti il motivo
 */
export function validateCustomDecks(raw: unknown): string | null {
  if (!isObject(raw)) return "mazzi personalizzati non validi";
  for (const [id, cards] of Object.entries(raw)) {
    if (cards === undefined) continue;
    if (!EDITABLE_DECK_IDS.includes(id as EditableDeckId))
      return `mazzo sconosciuto: ${id}`;
    if (
      !Array.isArray(cards) ||
      cards.length === 0 ||
      cards.length > MAX_CUSTOM_CARDS
    )
      return `${id}: servono da 1 a ${MAX_CUSTOM_CARDS} carte`;
    const valid =
      id === "quiz"
        ? cards.every(
            (c) => isObject(c) && isText(c.domanda) && isText(c.risposta),
          )
        : cards.every(isText);
    if (!valid) return `${id}: carta non valida`;
  }
  return null;
}
