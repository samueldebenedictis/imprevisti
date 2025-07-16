import type { Player } from "./player";

/**
 * Gestisce le battaglie tra due giocatori.
 * Una battaglia viene creata quando due giocatori si trovano sulla stessa casella.
 */
export class Battle {
  private player1: Player;
  private player2: Player;

  /**
   * Crea una nuova battaglia tra due giocatori.
   * @param player1 - Primo giocatore della battaglia
   * @param player2 - Secondo giocatore della battaglia
   */
  constructor(player1: Player, player2: Player) {
    this.player1 = player1;
    this.player2 = player2;
  }

  /**
   * Risolve la battaglia specificando il vincitore.
   * Valida che il vincitore sia uno dei due giocatori partecipanti alla battaglia.
   * @param winner - Il giocatore vincitore della battaglia
   * @returns Il giocatore vincitore validato
   * @throws Errore se il vincitore non è uno dei due giocatori della battaglia
   */
  resolveBattle(winner: Player): Player {
    if (winner !== this.player1 && winner !== this.player2) {
      throw new Error("Winner must be one of the players in the battle");
    }
    return winner;
  }

  /**
   * Restituisce entrambi i giocatori della battaglia come tupla.
   * @returns Array con i due giocatori della battaglia
   */
  getPlayers(): [Player, Player] {
    return [this.player1, this.player2];
  }

  /**
   * Restituisce l'avversario del giocatore specificato.
   * @param player - Il giocatore di cui si vuole conoscere l'avversario
   * @returns L'avversario del giocatore specificato
   * @throws Errore se il giocatore non fa parte della battaglia
   */
  getOpponent(player: Player): Player {
    if (player === this.player1) {
      return this.player2;
    }
    if (player === this.player2) {
      return this.player1;
    }
    throw new Error("Player is not part of this battle");
  }
}
