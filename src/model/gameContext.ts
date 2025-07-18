import type { Board } from "./board";
import type { Deck } from "./deck/deck";
import type { Dice } from "./dice";
import type { GameStateManager, MovementManager } from "./managers";
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
   * @param mimeDeck - Il mazzo di carte per il mimo
   * @param quizDeck - Il mazzo di carte per il quiz
   * @param dice - Il dado utilizzato nel gioco
   * @param movementManager - Manager per gestire i movimenti dei giocatori
   * @param gameStateManager - Manager per gestire lo stato del gioco
   */
  constructor(
    public player: Player,
    public board: Board,
    public players: Player[],
    public mimeDeck: Deck,
    public quizDeck: Deck,
    public dice: Dice,
    public movementManager: MovementManager,
    public gameStateManager: GameStateManager,
  ) {}
}
