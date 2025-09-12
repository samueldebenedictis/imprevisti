import type { Battle } from "../battle";
import type { Player } from "../player";
import type { Draw } from "../square";
import type { MovementManager } from "./movement-manager";

/**
 * Gestisce la logica dei disegni nel gioco.
 * Si occupa di risolvere le azioni di disegno e gestire le conseguenze.
 */
export class DrawManager {
  /**
   * Crea un nuovo gestore dei disegni.
   * @param movementManager - Gestore del movimento per spostare i giocatori
   */
  constructor(private movementManager: MovementManager) {}

  /**
   * Risolve un'azione di disegno, applicando gli effetti in base al successo o fallimento.
   * @param drawAction - L'oggetto Draw da risolvere
   * @param success - True se il disegno è stato indovinato, false altrimenti
   * @param guessPlayer - Il giocatore che ha indovinato il disegno (richiesto se success è true)
   * @returns Array con eventuali collisioni risultanti dal movimento dei giocatori
   */
  resolveDraw(
    drawAction: Draw,
    success: boolean,
    guessPlayer?: Player,
  ): [Battle | null, Battle | null] {
    if (success && guessPlayer) {
      return this.handleDrawSuccess(drawAction.drawPlayer, guessPlayer);
    } else {
      this.handleDrawFailure(drawAction.drawPlayer);
      return [null, null];
    }
  }

  /**
   * Gestisce il successo del disegno spostando entrambi i giocatori in avanti.
   * @param drawPlayer - Il giocatore che ha eseguito il disegno
   * @param guessPlayer - Il giocatore che ha indovinato il disegno
   * @returns Array con eventuali collisioni per entrambi i giocatori
   */
  private handleDrawSuccess(
    drawPlayer: Player,
    guessPlayer: Player,
  ): [Battle | null, Battle | null] {
    const [result1, result2] = this.movementManager.moveBothPlayersForward(
      drawPlayer,
      guessPlayer,
    );

    return [result1.collision, result2.collision];
  }

  /**
   * Gestisce il fallimento del disegno facendo saltare il prossimo turno al giocatore.
   * @param drawPlayer - Il giocatore che ha eseguito il disegno
   */
  private handleDrawFailure(drawPlayer: Player): void {
    drawPlayer.skipNextTurn();
  }

  /**
   * Verifica se un disegno è valido (ha tutte le proprietà necessarie).
   * @param drawAction - L'azione di disegno da validare
   * @returns True se il disegno è valido, false altrimenti
   */
  isValidDraw(drawAction: Draw): boolean {
    return !!(drawAction.drawPlayer && drawAction.cardTopic);
  }
}
