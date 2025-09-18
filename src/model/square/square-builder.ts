import { BackWriteSquare } from "./backwrite-square";
import { DictationDrawSquare } from "./dictation-draw-square";
import { FaceEmotionSquare } from "./face-emotion-square";
import { MimeSquare } from "./mime-square";
import { MoveSquare } from "./move-square";
import { MusicEmotionSquare } from "./music-emotion-square";
import { PhysicalTestSquare } from "./physical-test-square";
import { QuizSquare } from "./quiz-square";
import { type MoveSquareJSON, Square, type SquareJSON } from "./square";
import { WhatWouldYouDoSquare } from "./what-would-you-do-square";

/**
 * Ricostruisce un'istanza di Square (o una sua sottoclasse) da un oggetto JSON.
 * Questo metodo fungerà da factory per creare l'istanza corretta della casella
 * in base al suo tipo serializzato.
 * @param json - L'oggetto JSON da cui ricostruire la Square.
 * @returns Una nuova istanza di Square o una sua sottoclasse.
 * @throws Error se il tipo di casella non è riconosciuto.
 */
export function squareFromJSON(json: SquareJSON): Square {
  switch (json.type) {
    case "mime":
      return new MimeSquare(json.number);
    case "quiz":
      return new QuizSquare(json.number);
    case "backwrite":
      return new BackWriteSquare(json.number);
    case "face-emotion":
      return new FaceEmotionSquare(json.number);
    case "music-emotion":
      return new MusicEmotionSquare(json.number);
    case "physical-test":
      return new PhysicalTestSquare(json.number);
    case "what-would-you-do":
      return new WhatWouldYouDoSquare(json.number);
    case "dictation-draw":
      return new DictationDrawSquare(json.number);
    case "move":
      return new MoveSquare(json.number, (json as MoveSquareJSON).moveValue);
    default:
      return new Square(json.number);
  }
}
