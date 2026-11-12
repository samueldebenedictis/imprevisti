import type { SquareType } from "@/model/square/square";
import type { GameConfig } from "@/store/config-store";
import { MAX_SQUARES, MIN_SQUARES } from "@/vars";

export const SQUARE_TYPES: readonly SquareType[] = [
  "normal",
  "mime",
  "quiz",
  "move",
  "backwrite",
  "face-emotion",
  "emotion-video",
  "music-emotion",
  "physical-test",
  "what-would-you-do",
  "dictation-draw",
];

export const MAX_MOVE = 5;

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const isIntInRange = (v: unknown, min: number, max: number) =>
  typeof v === "number" && Number.isInteger(v) && v >= min && v <= max;

/**
 * Controlla la configurazione del tabellone inviata dall'host a /start.
 * Applica gli stessi limiti dell'interfaccia (10–100 caselle, percentuale
 * 0–100, caselle movimento da −5 a +5), così che una richiesta costruita a mano
 * non possa creare tabelloni enormi o caselle sconosciute.
 * @param raw - Il valore ricevuto nel corpo della richiesta
 * @returns Un messaggio di errore, oppure null se la configurazione è valida
 */
export function validateBoardConfig(raw: unknown): string | null {
  if (!isObject(raw)) return "boardConfig mancante";
  const config = raw as Partial<GameConfig> & Record<string, unknown>;

  if (!isIntInRange(config.numSquares, MIN_SQUARES, MAX_SQUARES))
    return `numSquares deve essere un intero tra ${MIN_SQUARES} e ${MAX_SQUARES}`;
  const numSquares = config.numSquares as number;

  if (
    typeof config.specialPercentage !== "number" ||
    !Number.isFinite(config.specialPercentage) ||
    config.specialPercentage < 0 ||
    config.specialPercentage > 100
  )
    return "specialPercentage deve essere tra 0 e 100";

  if (
    !isObject(config.squareTypes) ||
    !Object.values(config.squareTypes).every((v) => typeof v === "boolean")
  )
    return "squareTypes non valido";

  if (
    config.battlesEnabled !== undefined &&
    typeof config.battlesEnabled !== "boolean"
  )
    return "battlesEnabled non valido";

  const custom = config.customSquares;
  if (custom === null || custom === undefined) return null;
  if (!Array.isArray(custom)) return "customSquares non valido";
  // Come nello schermo singolo, un tabellone personalizzato di lunghezza
  // diversa viene ignorato e sostituito da uno generato
  if (custom.length !== numSquares) return null;

  const valid = custom.every(
    (sq, i) =>
      isObject(sq) &&
      sq.number === i &&
      SQUARE_TYPES.includes(sq.type as SquareType) &&
      (sq.type !== "move" || isIntInRange(sq.moveValue, -MAX_MOVE, MAX_MOVE)),
  );
  return valid ? null : "customSquares non valido";
}
