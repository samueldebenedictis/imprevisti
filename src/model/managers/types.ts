import type { Battle } from "../battle";
import type { Draw, Mime, Quiz } from "../square";

/**
 * Risultato di un'azione di gioco che può essere una battaglia, un mimo, un quiz, un disegno o nessuna azione speciale.
 */
export type GameActionResult = {
  type: "battle" | "mime" | "quiz" | "draw" | "none";
  data?: Battle | Mime | Quiz | Draw;
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
