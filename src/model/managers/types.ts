import type { Battle } from "../battle";
import type { Mime } from "../square";

/**
 * Risultato di un'azione di gioco che può essere una battaglia, un mimo o nessuna azione speciale.
 */
export type GameActionResult = {
  type: "battle" | "mime" | "none";
  data?: Battle | Mime;
};

/**
 * Risultato di un movimento che può includere collisioni multiple.
 */
export type MovementResult = {
  collision: Battle | null;
  gameEnded: boolean;
};
