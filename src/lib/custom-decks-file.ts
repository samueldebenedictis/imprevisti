import {
  type CustomDecks,
  defaultDeckCards,
  EDITABLE_DECK_IDS,
  type EditableDeckId,
  MAX_CARD_TEXT,
  MAX_CUSTOM_CARDS,
  type QuizCardData,
} from "@/model/deck/custom-decks";

/**
 * File delle domande personalizzate, scritto e letto dal docente: chiavi in
 * italiano, così si può anche modificare a mano.
 */
export const CUSTOM_DECKS_FILE_VERSION = 1;
export const CUSTOM_DECKS_FILENAME = "domande-imprevisti.json";

export const FILE_KEYS: Record<EditableDeckId, string> = {
  quiz: "quiz",
  whatWouldYouDo: "cosaFaresti",
  mime: "mimo",
  backWrite: "paroleAlleSpalle",
  musicEmotion: "emozioniInMusica",
  physicalTest: "proveFisiche",
};

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

/**
 * Contenuto del file da esportare: tutti i mazzi personalizzabili, con le
 * carte personalizzate o, se il mazzo non è stato toccato, quelle predefinite.
 */
export function customDecksToFile(decks: CustomDecks) {
  const defaults = defaultDeckCards();
  const file: Record<string, unknown> = { versione: CUSTOM_DECKS_FILE_VERSION };
  for (const id of EDITABLE_DECK_IDS)
    file[FILE_KEYS[id]] = decks[id] ?? defaults[id];
  return file;
}

/** Testo ripulito, o il motivo per cui la carta non va bene. */
function cleanText(value: unknown, what: string): string | { error: string } {
  if (typeof value !== "string") return { error: `manca ${what}` };
  const text = value.trim();
  if (!text) return { error: `${what} non può essere vuoto` };
  if (text.length > MAX_CARD_TEXT)
    return { error: `${what} supera i ${MAX_CARD_TEXT} caratteri` };
  return text;
}

type DeckCards = string[] | QuizCardData[];

/**
 * Errore su un mazzo. `card` (da 0) e `field` indicano la carta e il campo
 * sbagliati, quando l'errore riguarda una carta sola.
 */
export type DeckCardsError = {
  error: string;
  card?: number;
  field?: "text" | "answer";
};

/**
 * Ripulisce le carte di un mazzo: toglie gli spazi ai bordi e conta una volta
 * sola le carte ripetute.
 * @param label - Nome del mazzo da usare nei messaggi di errore
 * @returns le carte pulite, oppure un errore che indica mazzo e carta
 */
export function cleanDeckCards(
  id: EditableDeckId,
  cards: unknown,
  label: string,
): { cards: DeckCards } | DeckCardsError {
  if (!Array.isArray(cards))
    return { error: `${label}: serve un elenco di carte` };

  const seen = new Set<string>();
  const kept: (string | QuizCardData)[] = [];
  for (const [i, card] of cards.entries()) {
    const where = `${label}, carta ${i + 1}`;
    let clean: string | QuizCardData;
    if (id === "quiz") {
      if (!isObject(card))
        return {
          error: `${where}: servono domanda e risposta`,
          card: i,
          field: "text",
        };
      const domanda = cleanText(card.domanda, "il testo della domanda");
      if (typeof domanda !== "string")
        return { error: `${where}: ${domanda.error}`, card: i, field: "text" };
      const risposta = cleanText(card.risposta, "il testo della risposta");
      if (typeof risposta !== "string")
        return {
          error: `${where}: ${risposta.error}`,
          card: i,
          field: "answer",
        };
      clean = { domanda, risposta };
    } else {
      const text = cleanText(card, "il testo");
      if (typeof text !== "string")
        return { error: `${where}: ${text.error}`, card: i, field: "text" };
      clean = text;
    }
    const signature = JSON.stringify(clean);
    if (seen.has(signature)) continue;
    seen.add(signature);
    kept.push(clean);
  }

  if (kept.length === 0) return { error: `${label}: nessuna carta` };
  if (kept.length > MAX_CUSTOM_CARDS)
    return { error: `${label}: al massimo ${MAX_CUSTOM_CARDS} carte` };
  return { cards: kept as DeckCards };
}

/**
 * Legge un file di domande personalizzate (vedi cleanDeckCards); un mazzo
 * assente resta quello predefinito.
 * @returns i mazzi letti, oppure un errore che indica mazzo e carta
 */
export function customDecksFromFile(
  raw: unknown,
): { decks: CustomDecks } | { error: string } {
  if (!isObject(raw)) return { error: "il file non contiene un oggetto JSON" };
  if (raw.versione !== undefined && raw.versione !== CUSTOM_DECKS_FILE_VERSION)
    return { error: `versione del file non supportata: ${raw.versione}` };

  const known = new Set(["versione", ...Object.values(FILE_KEYS)]);
  const unknown = Object.keys(raw).find((key) => !known.has(key));
  if (unknown) return { error: `chiave sconosciuta: ${unknown}` };

  const decks: CustomDecks = {};
  for (const id of EDITABLE_DECK_IDS) {
    const key = FILE_KEYS[id];
    if (raw[key] === undefined) continue;
    const result = cleanDeckCards(id, raw[key], key);
    if ("error" in result) return { error: result.error };
    (decks as Record<string, unknown>)[id] = result.cards;
  }
  return { decks };
}
