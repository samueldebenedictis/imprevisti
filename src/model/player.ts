/**
 * Rappresenta un giocatore del gioco.
 * Ogni giocatore ha un identificativo univoco e un nome.
 */
export class Player {
  private name: string;
  private id: number;
  private turnsToSkip: number;

  /**
   * Crea un nuovo giocatore con ID e nome specificati.
   * @param id - Identificativo univoco del giocatore
   * @param name - Nome del giocatore
   */
  constructor(id: number, name: string) {
    this.name = name;
    this.id = id;
    this.turnsToSkip = 0;
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

  /**
   * Restituisce il numero di turni che il giocatore deve saltare.
   * @returns Numero di turni da saltare
   */
  getTurnsToSkip = () => this.turnsToSkip;

  /**
   * Imposta il numero di turni che il giocatore deve saltare.
   * @param turns - Numero di turni da saltare
   */
  skipNextTurn = (turns = 1) => {
    this.turnsToSkip = turns;
  };

  /**
   * Imposta direttamente il numero di turni da saltare.
   * Usato principalmente per la deserializzazione.
   * @param turns - Numero di turni da saltare
   */
  setTurnsToSkip = (turns: number) => {
    this.turnsToSkip = turns;
  };

  /**
   * Verifica se il giocatore deve saltare il turno corrente.
   * Se deve saltare, decrementa il contatore dei turni da saltare.
   * @returns True se il giocatore deve saltare il turno, false altrimenti
   */
  mustSkipTurn = () => {
    if (this.turnsToSkip > 0) {
      this.turnsToSkip--;
      return true;
    }
    return false;
  };
}
