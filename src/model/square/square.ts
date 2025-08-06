import { MimeSquare } from "./mime-square";
import { GoToStartSquare, MoveSquare } from "./move-square";
import { QuizSquare } from "./quiz-square";

/**
 * Rappresenta una casella base del tabellone di gioco.
 * Ogni casella ha un numero identificativo univoco.
 */
export class Square {
  private number: number;
  protected type: string; // Aggiungi una proprietà per il tipo di casella

  /**
   * Crea una nuova casella con l'ID specificato.
   * @param id - Numero identificativo della casella
   */
  constructor(id: number) {
    this.number = id;
    this.type = "normal"; // Tipo di default
  }

  /**
   * Restituisce il numero identificativo della casella.
   * @returns Numero della casella
   */
  getNumber = () => this.number;

  /**
   * Restituisce il tipo di casella.
   * @returns Tipo della casella
   */
  getType = () => this.type;

  /**
   * Converte l'istanza di Square in un oggetto JSON serializzabile.
   * @returns Un oggetto che rappresenta lo stato della Square in formato JSON.
   */
  toJSON() {
    return {
      number: this.number,
      type: this.type,
    };
  }

  /**
   * Ricostruisce un'istanza di Square (o una sua sottoclasse) da un oggetto JSON.
   * Questo metodo fungerà da factory per creare l'istanza corretta della casella
   * in base al suo tipo serializzato.
   * @param json - L'oggetto JSON da cui ricostruire la Square.
   * @returns Una nuova istanza di Square o una sua sottoclasse.
   * @throws Error se il tipo di casella non è riconosciuto.
   */
  static fromJSON(json: any): Square {
    switch (json.type) {
      case "mime":
        return new MimeSquare(json.number);
      case "quiz":
        return new QuizSquare(json.number);
      case "move":
        return new MoveSquare(json.number, json.moveValue);
      case "goToStart":
        return new GoToStartSquare(json.number);
      case "special":
        // Non dovremmo mai istanziare SpecialSquare direttamente,
        // ma solo le sue sottoclassi concrete.
        // Se arriviamo qui, significa che c'è un tipo "special" non gestito.
        throw new Error(
          `Unknown special square type for number ${json.number}`,
        );
      default:
        return new Square(json.number);
    }
  }
}
