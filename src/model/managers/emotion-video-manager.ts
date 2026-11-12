import type { Battle } from "../battle";
import type { EmotionVideo } from "../deck";
import type { Player } from "../player";
import type { MovementManager } from "./movement-manager";

/**
 * Gestisce la logica per le scene di film nel gioco.
 * Risolve le azioni film e gestisce le conseguenze.
 */
export class EmotionVideoManager {
  /**
   * Crea un nuovo gestore delle scene di film.
   * @param movementManager - Il gestore dei movimenti per muovere i giocatori.
   */
  constructor(private movementManager: MovementManager) {}

  /**
   * Risolve un'azione film, applicando effetti in base al successo o al fallimento.
   * @param emotionVideoAction - L'oggetto EmotionVideo da risolvere.
   * @param success - True se l'emozione della scena è stata indovinata, altrimenti false.
   * @returns Un oggetto Battle se si verifica una collisione come risultato del movimento, altrimenti null.
   */
  resolveEmotionVideo(
    emotionVideoAction: EmotionVideo,
    success: boolean,
  ): Battle | null {
    if (success) {
      return this.handleEmotionVideoSuccess(emotionVideoAction.emotionPlayer);
    }
    this.handleEmotionVideoFailure(emotionVideoAction.emotionPlayer);
    return null;
  }

  /**
   * Gestisce il successo spostando il giocatore in avanti.
   * @param emotionPlayer - Il giocatore che ha indovinato l'emozione.
   * @returns Un oggetto Battle se si verifica una collisione, altrimenti null.
   */
  private handleEmotionVideoSuccess(emotionPlayer: Player): Battle | null {
    const result = this.movementManager.movePlayerForward(emotionPlayer);
    return result.collision;
  }

  /**
   * Gestisce il fallimento facendo saltare il turno successivo al giocatore.
   * @param emotionPlayer - Il giocatore che ha sbagliato l'emozione.
   */
  private handleEmotionVideoFailure(emotionPlayer: Player): void {
    emotionPlayer.skipNextTurn();
  }
}
