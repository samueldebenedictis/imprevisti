import { Battle } from "../battle";
import type { Board } from "../board";
import type { Player } from "../player";
import type { GameStateManager } from "./game-state-manager";
import type { MovementResult } from "./types";

/**
 * Gestisce la logica di movimento dei giocatori e il controllo delle collisioni.
 * Si occupa di spostare i giocatori sul tabellone e verificare eventuali scontri.
 */
export class MovementManager {
  /**
   * Crea un nuovo gestore del movimento.
   * @param board - Il tabellone di gioco
   * @param gameStateManager - Il gestore dello stato del gioco
   */
  constructor(
    private board: Board,
    private gameStateManager: GameStateManager,
  ) {}

  /**
   * Sposta un giocatore alla nuova posizione e controlla le collisioni.
   * Se la posizione supera la dimensione del tabellone, il giocatore viene posto all'ultima casella.
   * @param player - Il giocatore da spostare
   * @param newPosition - La nuova posizione desiderata
   * @returns Risultato del movimento con eventuale collisione e stato del gioco
   */
  movePlayerAndCheckCollision(
    player: Player,
    newPosition: number,
  ): MovementResult {
    const boardSize = this.board.getSquares().length;
    const finalPosition = Math.min(newPosition, boardSize);

    this.board.movePlayer(player, finalPosition);

    // Controlla condizione di vittoria
    const gameEnded = this.gameStateManager.checkWinCondition(
      player,
      finalPosition,
    );
    if (gameEnded) {
      return { collision: null, gameEnded: true };
    }

    // Controlla collisioni
    const collision = this.checkCollision(player);
    return { collision, gameEnded: false };
  }

  /**
   * Controlla se il giocatore corrente è in collisione con altri giocatori sulla stessa casella.
   * @param currentPlayer - Il giocatore da controllare per le collisioni
   * @returns Un oggetto Battle se si verifica una collisione, null altrimenti
   */
  private checkCollision(currentPlayer: Player): Battle | null {
    const position = this.board.getPlayerPosition(currentPlayer);
    const playersOnSquare = this.board.getPlayersOnSquare(position);

    if (playersOnSquare.length > 1) {
      // Trova l'altro giocatore (non quello corrente)
      const opponent = playersOnSquare.find((p) => p !== currentPlayer);
      if (opponent) {
        return new Battle(currentPlayer, opponent);
      }
    }
    return null;
  }

  /**
   * Sposta un giocatore di una posizione in avanti dopo aver vinto una battaglia.
   * Utilizzato per la risoluzione delle battaglie.
   * @param winner - Il giocatore vincitore da spostare
   * @returns Risultato del movimento con eventuale nuova collisione
   */
  moveWinnerForward(winner: Player): MovementResult {
    const currentPosition = this.board.getPlayerPosition(winner);
    return this.movePlayerAndCheckCollision(winner, currentPosition + 1);
  }

  /**
   * Sposta un giocatore di una posizione in avanti.
   * @param player - Il giocatore da spostare
   * @returns Risultato del movimento con eventuale nuova collisione
   */
  movePlayerForward(player: Player): MovementResult {
    return this.moveWinnerForward(player);
  }

  /**
   * Sposta due giocatori di una posizione in avanti.
   * Utilizzato per il successo del mimo.
   * @param player1 - Primo giocatore da spostare
   * @param player2 - Secondo giocatore da spostare
   * @returns Array con i risultati del movimento di entrambi i giocatori
   */
  moveBothPlayersForward(
    player1: Player,
    player2: Player,
  ): [MovementResult, MovementResult] {
    const result1 = this.moveWinnerForward(player1);
    const result2 = this.moveWinnerForward(player2);
    return [result1, result2];
  }
}
