import type { Battle } from "../battle";
import type { Mime, Quiz } from "../square";

/**
 * Risultato di un'azione di gioco che può essere una battaglia, un mimo, un quiz o nessuna azione speciale.
 */
export type GameActionResult = {
  type: "battle" | "mime" | "quiz" | "none";
  data?: Battle | Mime | Quiz;
  diceResult: number;
  actionType: string | null;
};

/**
 * Risultato di un movimento che può includere collisioni multiple.
 */
export type MovementResult = {
  collision: Battle | null;
  gameEnded: boolean;
};
