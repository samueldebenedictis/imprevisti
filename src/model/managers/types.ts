import type { Battle } from "../battle";
import type {
  BackWrite,
  DictationDraw,
  Mime,
  MusicEmotion,
  PhysicalTest,
  Quiz,
  WhatWouldYouDo,
} from "../square";

/**
 * Risultato di un'azione di gioco che può essere una battaglia, un mimo, un quiz, uno scrivere sulla schiena, musica emozioni, test fisico, cosa faresti se, disegno dettato o nessuna azione speciale.
 */
export type GameActionResult = {
  type:
    | "battle"
    | "mime"
    | "quiz"
    | "backwrite"
    | "music-emotion"
    | "physical-test"
    | "what-would-you-do"
    | "dictation-draw"
    | "none";
  data?:
    | Battle
    | Mime
    | Quiz
    | BackWrite
    | MusicEmotion
    | PhysicalTest
    | WhatWouldYouDo
    | DictationDraw;
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
