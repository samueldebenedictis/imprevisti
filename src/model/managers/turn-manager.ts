import type { Player } from "../player";

/**
 * Gestisce la logica dei turni e dei round del gioco.
 * Mantiene traccia del giocatore corrente e del round attuale.
 */
export class TurnManager {
  private currentTurn = 0;
  private currentRound = 1;

  /**
   * Crea un nuovo gestore dei turni.
   * @param players - Array dei giocatori della partita
   */
  constructor(private players: Player[]) {}

  /**
   * Restituisce il giocatore che deve giocare il turno corrente.
   * @returns Il giocatore del turno corrente
   */
  getCurrentPlayer(): Player {
    return this.players[this.currentTurn];
  }

  /**
   * Avanza al turno successivo e incrementa il round se necessario.
   * Quando tutti i giocatori hanno giocato il loro turno, inizia un nuovo round.
   */
  advanceTurn(): void {
    if (this.currentTurn === this.players.length - 1) {
      this.currentTurn = 0;
      this.currentRound++;
    } else {
      this.currentTurn++;
    }
  }

  /**
   * Restituisce l'indice del turno corrente.
   * @returns Indice del giocatore che deve giocare il turno corrente
   */
  getCurrentTurn(): number {
    return this.currentTurn;
  }

  /**
   * Restituisce il numero del round corrente.
   * @returns Numero del round attuale (inizia da 1)
   */
  getCurrentRound(): number {
    return this.currentRound;
  }

  /**
   * Restituisce tutti i giocatori della partita.
   * @returns Array di tutti i giocatori
   */
  getPlayers(): Player[] {
    return this.players;
  }

  /**
   * Ricostruisce un'istanza di TurnManager da un oggetto JSON.
   * @param currentTurn - L'indice del turno corrente da ripristinare.
   * @param currentRound - Il numero del round corrente da ripristinare.
   * @param players - L'array di istanze Player già ricostruite.
   * @returns Una nuova istanza di TurnManager.
   */
  static fromJSON(
    currentTurn: number,
    currentRound: number,
    players: Player[],
  ): TurnManager {
    const turnManager = new TurnManager(players);
    turnManager.currentRound = currentRound;
    turnManager.currentTurn = currentTurn;
    return turnManager;
  }
}
