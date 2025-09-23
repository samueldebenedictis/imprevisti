import type { Battle } from "../battle";
import type { FaceEmotion } from "../deck";
import type { Player } from "../player";
import type { MovementManager } from "./movement-manager";

/**
 * Gestisce la logica per le emozioni facciali nel gioco.
 * Risolve le azioni delle emozioni facciali e gestisce le conseguenze.
 */
export class FaceEmotionManager {
  /**
   * Crea un nuovo gestore delle emozioni facciali.
   * @param movementManager - Il gestore dei movimenti per muovere i giocatori.
   */
  constructor(private movementManager: MovementManager) {}

  /**
   * Risolve un'azione emozione facciale, applicando effetti in base al successo o al fallimento.
   * @param faceEmotionAction - L'oggetto FaceEmotion da risolvere.
   * @param success - True se l'emozione è stata indovinata correttamente, altrimenti false.
   * @returns Un oggetto Battle se si verifica una collisione come risultato del movimento, altrimenti null.
   */
  resolveFaceEmotion(
    faceEmotionAction: FaceEmotion,
    success: boolean,
  ): Battle | null {
    if (success) {
      return this.handleFaceEmotionSuccess(faceEmotionAction.emotionPlayer);
    } else {
      this.handleFaceEmotionFailure(faceEmotionAction.emotionPlayer);
      return null;
    }
  }

  /**
   * Gestisce il successo dell'emozione facciale spostando il giocatore in avanti.
   * @param emotionPlayer - Il giocatore che ha indovinato correttamente l'emozione.
   * @returns Un oggetto Battle se si verifica una collisione, altrimenti null.
   */
  private handleFaceEmotionSuccess(emotionPlayer: Player): Battle | null {
    const result = this.movementManager.movePlayerForward(emotionPlayer);
    return result.collision;
  }

  /**
   * Gestisce il fallimento dell'emozione facciale facendo saltare il turno successivo al giocatore.
   * @param emotionPlayer - Il giocatore che ha sbagliato l'emozione.
   */
  private handleFaceEmotionFailure(emotionPlayer: Player): void {
    emotionPlayer.skipNextTurn();
  }
}
