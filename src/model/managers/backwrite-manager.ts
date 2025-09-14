import type { Battle } from "../battle";
import type { BackWrite } from "../deck/backwrite";
import type { Player } from "../player";
import type { MovementManager } from "./movement-manager";

/**
 * Gestisce la logica dello scrivere sulla schiena nel gioco.
 * Si occupa di risolvere le azioni di scrittura sulla schiena e gestire le conseguenze.
 */
export class BackWriteManager {
  /**
   * Crea un nuovo gestore dello scrivere sulla schiena.
   * @param movementManager - Gestore del movimento per spostare i giocatori
   */
  constructor(private movementManager: MovementManager) {}

  /**
   * Risolve un'azione di scrittura sulla schiena, applicando gli effetti in base al successo o fallimento.
   * @param backWriteAction - L'oggetto BackWrite da risolvere
   * @param success - True se la scrittura è stata indovinata, false altrimenti
   * @param guessPlayer - Il giocatore che ha indovinato la scrittura (richiesto se success è true)
   * @returns Array con eventuali collisioni risultanti dal movimento dei giocatori
   */
  resolveBackWrite(
    backWriteAction: BackWrite,
    success: boolean,
    guessPlayer?: Player,
  ): [Battle | null, Battle | null] {
    if (success && guessPlayer) {
      return this.handleBackWriteSuccess(
        backWriteAction.backWritePlayer,
        guessPlayer,
      );
    } else {
      this.handleBackWriteFailure(backWriteAction.backWritePlayer);
      return [null, null];
    }
  }

  /**
   * Gestisce il successo della scrittura sulla schiena spostando entrambi i giocatori in avanti.
   * @param backWritePlayer - Il giocatore che ha eseguito la scrittura
   * @param guessPlayer - Il giocatore che ha indovinato la scrittura
   * @returns Array con eventuali collisioni per entrambi i giocatori
   */
  private handleBackWriteSuccess(
    backWritePlayer: Player,
    guessPlayer: Player,
  ): [Battle | null, Battle | null] {
    const [result1, result2] = this.movementManager.moveBothPlayersForward(
      backWritePlayer,
      guessPlayer,
    );

    return [result1.collision, result2.collision];
  }

  /**
   * Gestisce il fallimento della scrittura facendo saltare il prossimo turno al giocatore.
   * @param backWritePlayer - Il giocatore che ha eseguito la scrittura
   */
  private handleBackWriteFailure(backWritePlayer: Player): void {
    backWritePlayer.skipNextTurn();
  }

  /**
   * Verifica se una scrittura sulla schiena è valida (ha tutte le proprietà necessarie).
   * @param backWriteAction - L'azione di scrittura da validare
   * @returns True se la scrittura è valida, false altrimenti
   */
  isValidBackWrite(backWriteAction: BackWrite): boolean {
    return !!(backWriteAction.backWritePlayer && backWriteAction.cardTopic);
  }
}
