export interface SquareJSON {
  number: number;
  type: string;
}

export interface MoveSquareJSON extends SquareJSON {
  moveValue: number;
}

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
  toJSON(): SquareJSON {
    return {
      number: this.number,
      type: this.type,
    };
  }
}
