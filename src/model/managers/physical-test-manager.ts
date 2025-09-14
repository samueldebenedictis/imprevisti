import type { Battle } from "../battle";
import type { PhysicalTest } from "../deck/physical-test";
import type { Player } from "../player";
import type { MovementManager } from "./movement-manager";

/**
 * Gestisce la logica dei test fisici nel gioco.
 * Si occupa di risolvere le azioni dei test fisici e gestire le conseguenze.
 */
export class PhysicalTestManager {
  /**
   * Crea un nuovo gestore dei test fisici.
   * @param movementManager - Gestore del movimento per spostare i giocatori
   */
  constructor(private movementManager: MovementManager) {}

  /**
   * Risolve un'azione di test fisico, applicando gli effetti in base al successo o fallimento.
   * @param physicalTestAction - L'oggetto PhysicalTest da risolvere
   * @param success - True se il test è stato completato correttamente, false altrimenti
   * @returns Array con eventuali collisioni risultanti dal movimento dei giocatori
   */
  resolvePhysicalTest(
    physicalTestAction: PhysicalTest,
    success: boolean,
  ): [Battle | null] {
    if (success) {
      return this.handlePhysicalTestSuccess(
        physicalTestAction.physicalTestPlayer,
      );
    } else {
      this.handlePhysicalTestFailure(physicalTestAction.physicalTestPlayer);
      return [null];
    }
  }

  /**
   * Gestisce il successo del test fisico spostando il giocatore in avanti.
   * @param physicalTestPlayer - Il giocatore che ha eseguito il test fisico
   * @returns Eventuale collisione risultante dal movimento del giocatore
   */
  private handlePhysicalTestSuccess(
    physicalTestPlayer: Player,
  ): [Battle | null] {
    const result = this.movementManager.movePlayerForward(physicalTestPlayer);
    return [result.collision];
  }

  /**
   * Gestisce il fallimento del test fisico facendo saltare il prossimo turno al giocatore.
   * @param physicalTestPlayer - Il giocatore che ha eseguito il test fisico
   */
  private handlePhysicalTestFailure(physicalTestPlayer: Player): void {
    physicalTestPlayer.skipNextTurn();
  }

  /**
   * Verifica se un test fisico è valido (ha tutte le proprietà necessarie).
   * @param physicalTestAction - L'azione di test fisico da validare
   * @returns True se il test fisico è valido, false altrimenti
   */
  isValidPhysicalTest(physicalTestAction: PhysicalTest): boolean {
    return !!(
      physicalTestAction.physicalTestPlayer && physicalTestAction.cardTest
    );
  }
}
