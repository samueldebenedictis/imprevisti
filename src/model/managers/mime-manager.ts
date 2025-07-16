import type { Battle } from "../battle";
import type { Player } from "../player";
import type { Mime } from "../square";
import type { MovementManager } from "./movement-manager";

/**
 * Gestisce la logica dei mimi nel gioco.
 * Si occupa di risolvere le azioni di mimo e gestire le conseguenze.
 */
export class MimeManager {
  /**
   * Crea un nuovo gestore dei mimi.
   * @param movementManager - Gestore del movimento per spostare i giocatori
   */
  constructor(private movementManager: MovementManager) {}

  /**
   * Risolve un'azione di mimo, applicando gli effetti in base al successo o fallimento.
   * @param mimeAction - L'oggetto Mime da risolvere
   * @param success - True se il mimo è stato indovinato, false altrimenti
   * @param guessPlayer - Il giocatore che ha indovinato il mimo (richiesto se success è true)
   * @returns Array con eventuali collisioni risultanti dal movimento dei giocatori
   */
  resolveMime(
    mimeAction: Mime,
    success: boolean,
    guessPlayer?: Player,
  ): [Battle | null, Battle | null] {
    if (success && guessPlayer) {
      return this.handleMimeSuccess(mimeAction.mimePlayer, guessPlayer);
    } else {
      this.handleMimeFailure(mimeAction.mimePlayer);
      return [null, null];
    }
  }

  /**
   * Gestisce il successo del mimo spostando entrambi i giocatori in avanti.
   * @param mimePlayer - Il giocatore che ha eseguito il mimo
   * @param guessPlayer - Il giocatore che ha indovinato il mimo
   * @returns Array con eventuali collisioni per entrambi i giocatori
   */
  private handleMimeSuccess(
    mimePlayer: Player,
    guessPlayer: Player,
  ): [Battle | null, Battle | null] {
    const [result1, result2] = this.movementManager.moveBothPlayersForward(
      mimePlayer,
      guessPlayer,
    );

    return [result1.collision, result2.collision];
  }

  /**
   * Gestisce il fallimento del mimo facendo saltare il prossimo turno al giocatore.
   * @param mimePlayer - Il giocatore che ha eseguito il mimo
   */
  private handleMimeFailure(mimePlayer: Player): void {
    mimePlayer.skipNextTurn();
  }

  /**
   * Verifica se un mimo è valido (ha tutte le proprietà necessarie).
   * @param mimeAction - L'azione di mimo da validare
   * @returns True se il mimo è valido, false altrimenti
   */
  isValidMime(mimeAction: Mime): boolean {
    return !!(mimeAction.mimePlayer && mimeAction.cardTopic);
  }
}
