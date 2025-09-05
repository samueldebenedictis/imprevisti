import type { Battle } from "../battle";
import type { Player } from "../player";
import { Mime } from "../square";
import type { MovementManager } from "./movement-manager";
import type { SpecialSquareProcessor } from "./special-square-processor";
import type { TurnManager } from "./turn-manager";
import type { GameActionResult } from "./types";

/**
 * Gestisce la logica delle battaglie tra giocatori.
 * Si occupa di creare, risolvere e gestire le conseguenze delle battaglie.
 */
export class BattleManager {
  /**
   * Crea un nuovo gestore delle battaglie.
   * @param movementManager - Gestore del movimento per spostare i vincitori
   * @param specialSquareProcessor - Processore per gli effetti delle caselle speciali
   * @param turnManager - Gestore dei turni per accedere ai giocatori
   */
  constructor(
    private movementManager: MovementManager,
    private specialSquareProcessor: SpecialSquareProcessor,
    private turnManager: TurnManager,
  ) {}

  /**
   * Risolve una battaglia spostando il vincitore di una posizione in avanti.
   * Controlla se si verifica una nuova collisione nella posizione di destinazione.
   * @param battle - L'oggetto battaglia da risolvere
   * @param winner - Il giocatore vincitore della battaglia
   * @returns Un nuovo oggetto Battle se si verifica un'altra collisione, null altrimenti
   */
  resolveBattle(
    battle: Battle,
    winner: Player,
    diceResult: number,
  ): GameActionResult {
    // Valida che il vincitore sia parte della battaglia
    battle.resolveBattle(winner);

    // Sposta il vincitore in avanti di una posizione
    const movementResult = this.movementManager.moveWinnerForward(winner);

    if (movementResult.gameEnded) {
      return { type: "none", diceResult: diceResult, actionType: null }; // Gioco terminato, nessuna collisione possibile
    }

    if (movementResult.collision) {
      return {
        type: "battle",
        data: movementResult.collision,
        diceResult: diceResult,
        actionType: "battle",
      }; // Nuova battaglia necessaria
    }

    // Elabora gli effetti delle caselle speciali nella nuova posizione
    const effect = this.specialSquareProcessor.processSquareEffects(
      winner,
      this.turnManager.getPlayers(),
    );
    if (effect instanceof Mime) {
      return {
        type: "mime",
        data: effect,
        diceResult: diceResult,
        actionType: "mime",
      };
    }

    return { type: "none", diceResult: diceResult, actionType: null };
  }
}
