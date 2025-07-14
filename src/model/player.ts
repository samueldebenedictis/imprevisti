/**
 * Rappresenta un giocatore del gioco.
 * Ogni giocatore ha un identificativo univoco e un nome.
 */
export class Player {
  private name: string;
  private id: number;

  /**
   * Crea un nuovo giocatore con ID e nome specificati.
   * @param id - Identificativo univoco del giocatore
   * @param name - Nome del giocatore
   */
  constructor(id: number, name: string) {
    this.name = name;
    this.id = id;
  }

  /**
   * Restituisce il nome del giocatore.
   * @returns Nome del giocatore
   */
  getName = () => this.name;

  /**
   * Restituisce l'ID univoco del giocatore.
   * @returns Identificativo del giocatore
   */
  getId = () => this.id;
}
