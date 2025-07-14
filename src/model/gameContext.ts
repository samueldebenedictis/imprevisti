import type { Board } from "./board";
import type { Deck } from "./deck";
import type { Dice } from "./dice";
import type { Player } from "./player";

/**
 * Contesto di gioco che raggruppa tutti gli elementi necessari per l'esecuzione di comandi.
 * Viene utilizzato dal pattern Command per passare informazioni alle caselle speciali.
 */
export class GameContext {
  /**
   * Crea un nuovo contesto di gioco con tutti gli elementi necessari.
   * @param player - Il giocatore attualmente attivo
   * @param board - Il tabellone di gioco
   * @param players - Array di tutti i giocatori della partita
   * @param deck - Il mazzo di carte del gioco
   * @param dice - Il dado utilizzato nel gioco
   */
  constructor(
    public player: Player,
    public board: Board,
    public players: Player[],
    public deck: Deck,
    public dice: Dice,
  ) {}
}
