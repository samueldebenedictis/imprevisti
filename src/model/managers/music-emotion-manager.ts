import type { Battle } from "../battle";
import type { MusicEmotion } from "../deck/music-emotion";
import type { Player } from "../player";
import type { MovementManager } from "./movement-manager";

/**
 * Gestisce la logica della musica emozioni nel gioco.
 * Si occupa di risolvere le azioni di musica emozioni e gestire le conseguenze.
 */
export class MusicEmotionManager {
  /**
   * Crea un nuovo gestore della musica emozioni.
   * @param movementManager - Gestore del movimento per spostare i giocatori
   */
  constructor(private movementManager: MovementManager) {}

  /**
   * Risolve un'azione di musica emozioni, applicando gli effetti in base al successo o fallimento.
   * @param musicEmotionAction - L'oggetto MusicEmotion da risolvere
   * @param success - True se l'emozione è stata indovinata, false altrimenti
   * @returns Array con eventuali collisioni risultanti dal movimento dei giocatori
   */
  resolveMusicEmotion(
    musicEmotionAction: MusicEmotion,
    success: boolean,
  ): [Battle | null] {
    if (success) {
      return this.handleMusicEmotionSuccess(
        musicEmotionAction.musicEmotionPlayer,
      );
    } else {
      this.handleMusicEmotionFailure(musicEmotionAction.musicEmotionPlayer);
      return [null];
    }
  }

  /**
   * Gestisce il successo della musica emozioni spostando il giocatore in avanti.
   * @param musicEmotionPlayer - Il giocatore che ha eseguito la musica emozioni
   * @returns Eventuale collisione risultante dal movimento del giocatore
   */
  private handleMusicEmotionSuccess(
    musicEmotionPlayer: Player,
  ): [Battle | null] {
    const result = this.movementManager.movePlayerForward(musicEmotionPlayer);
    return [result.collision];
  }

  /**
   * Gestisce il fallimento della musica emozioni facendo saltare il prossimo turno al giocatore.
   * @param musicEmotionPlayer - Il giocatore che ha eseguito la musica emozioni
   */
  private handleMusicEmotionFailure(musicEmotionPlayer: Player): void {
    musicEmotionPlayer.skipNextTurn();
  }

  /**
   * Verifica se una musica emozioni è valida (ha tutte le proprietà necessarie).
   * @param musicEmotionAction - L'azione di musica emozioni da validare
   * @returns True se la musica emozioni è valida, false altrimenti
   */
  isValidMusicEmotion(musicEmotionAction: MusicEmotion): boolean {
    return !!(
      musicEmotionAction.musicEmotionPlayer && musicEmotionAction.cardEmotion
    );
  }
}
