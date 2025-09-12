export type SquareType = "normal" | "mime" | "quiz" | "move" | "draw";

export interface SquareJSON {
  number: number;
  type: SquareType;
  moveValue?: number;
}

export interface MoveSquareJSON extends SquareJSON {
  type: "move";
  moveValue: number;
}

/**
 * Rappresenta una casella base del tabellone di gioco.
 * Ogni casella ha un numero identificativo univoco.
 */
export class Square {
  private number: number;
  protected type: SquareType;
  protected moveValue?: number;

  /**
   * Crea una nuova casella con l'ID specificato.
   * @param id - Numero identificativo della casella
   * @param type - Tipo della casella (opzionale, default "normal")
   * @param moveValue - Valore di movimento per le caselle "move" (opzionale)
   */
  constructor(id: number, type: SquareType = "normal", moveValue?: number) {
    this.number = id;
    this.type = type;
    this.moveValue = moveValue;
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
  getType = (): SquareType => this.type;

  /**
   * Converte l'istanza di Square in un oggetto JSON serializzabile.
   * @returns Un oggetto che rappresenta lo stato della Square in formato JSON.
   */
  toJSON(): SquareJSON {
    const json: SquareJSON = {
      number: this.number,
      type: this.type,
    };
    if (this.type === "move" && this.moveValue !== undefined) {
      json.moveValue = this.moveValue;
    }
    return json;
  }
}
