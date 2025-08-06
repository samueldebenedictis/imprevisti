import { MimeSquare } from "./mime-square";
import { GoToStartSquare, MoveSquare } from "./move-square";
import { QuizSquare } from "./quiz-square";
import { type MoveSquareJSON, Square, type SquareJSON } from "./square";

// TODO: renderlo una classe?
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
    case "move":
      return new MoveSquare(json.number, (json as MoveSquareJSON).moveValue);
    case "goToStart":
      return new GoToStartSquare(json.number);
    case "special":
      // Non dovremmo mai istanziare SpecialSquare direttamente,
      // ma solo le sue sottoclassi concrete.
      // Se arriviamo qui, significa che c'è un tipo "special" non gestito.
      throw new Error(`Unknown special square type for number ${json.number}`);
    default:
      return new Square(json.number);
  }
}
