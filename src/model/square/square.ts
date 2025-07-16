/**
 * Rappresenta una casella base del tabellone di gioco.
 * Ogni casella ha un numero identificativo univoco.
 */
export class Square {
  private number: number;

  /**
   * Crea una nuova casella con l'ID specificato.
   * @param id - Numero identificativo della casella
   */
  constructor(id: number) {
    this.number = id;
  }

  /**
   * Restituisce il numero identificativo della casella.
   * @returns Numero della casella
   */
  getNumber = () => this.number;
}
