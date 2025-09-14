import type { Battle } from "../battle";
import type { WhatWouldYouDo } from "../deck/what-would-you-do";
import type { Player } from "../player";
import type { MovementManager } from "./movement-manager";

/**
 * Gestisce la logica delle domande "cosa faresti se" nel gioco.
 * Si occupa di risolvere le azioni delle domande "cosa faresti se" e gestire le conseguenze.
 */
export class WhatWouldYouDoManager {
  /**
   * Crea un nuovo gestore delle domande "cosa faresti se".
   * @param movementManager - Gestore del movimento per spostare i giocatori
   */
  constructor(private movementManager: MovementManager) {}

  /**
   * Risolve un'azione di domanda "cosa faresti se", applicando gli effetti in base al successo o fallimento.
   * @param whatWouldYouDoAction - L'oggetto WhatWouldYouDo da risolvere
   * @param success - True se la risposta convince gli altri giocatori, false altrimenti
   * @returns Array con eventuali collisioni risultanti dal movimento dei giocatori
   */
  resolveWhatWouldYouDo(
    whatWouldYouDoAction: WhatWouldYouDo,
    success: boolean,
  ): [Battle | null] {
    if (success) {
      return this.handleWhatWouldYouDoSuccess(
        whatWouldYouDoAction.whatWouldYouDoPlayer,
      );
    } else {
      this.handleWhatWouldYouDoFailure(
        whatWouldYouDoAction.whatWouldYouDoPlayer,
      );
      return [null];
    }
  }

  /**
   * Gestisce il successo della domanda "cosa faresti se" spostando il giocatore in avanti.
   * @param whatWouldYouDoPlayer - Il giocatore che ha risposto alla domanda
   * @returns Eventuale collisione risultante dal movimento del giocatore
   */
  private handleWhatWouldYouDoSuccess(
    whatWouldYouDoPlayer: Player,
  ): [Battle | null] {
    const result = this.movementManager.movePlayerForward(whatWouldYouDoPlayer);
    return [result.collision];
  }

  /**
   * Gestisce il fallimento della domanda "cosa faresti se" facendo saltare il prossimo turno al giocatore.
   * @param whatWouldYouDoPlayer - Il giocatore che ha risposto alla domanda
   */
  private handleWhatWouldYouDoFailure(whatWouldYouDoPlayer: Player): void {
    whatWouldYouDoPlayer.skipNextTurn();
  }

  /**
   * Verifica se una domanda "cosa faresti se" è valida (ha tutte le proprietà necessarie).
   * @param whatWouldYouDoAction - L'azione di domanda da validare
   * @returns True se la domanda è valida, false altrimenti
   */
  isValidWhatWouldYouDo(whatWouldYouDoAction: WhatWouldYouDo): boolean {
    return !!(
      whatWouldYouDoAction.whatWouldYouDoPlayer &&
      whatWouldYouDoAction.cardQuestion
    );
  }
}
