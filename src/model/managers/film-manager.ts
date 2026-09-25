import type { Battle } from "../battle";
import type { Film } from "../deck";
import type { Player } from "../player";
import type { MovementManager } from "./movement-manager";

/**
 * Gestisce la logica per le scene di film nel gioco.
 * Risolve le azioni film e gestisce le conseguenze.
 */
export class FilmManager {
  /**
   * Crea un nuovo gestore delle scene di film.
   * @param movementManager - Il gestore dei movimenti per muovere i giocatori.
   */
  constructor(private movementManager: MovementManager) {}

  /**
   * Risolve un'azione film, applicando effetti in base al successo o al fallimento.
   * @param filmAction - L'oggetto Film da risolvere.
   * @param success - True se l'emozione della scena è stata indovinata, altrimenti false.
   * @returns Un oggetto Battle se si verifica una collisione come risultato del movimento, altrimenti null.
   */
  resolveFilm(filmAction: Film, success: boolean): Battle | null {
    if (success) {
      return this.handleFilmSuccess(filmAction.emotionPlayer);
    }
    this.handleFilmFailure(filmAction.emotionPlayer);
    return null;
  }

  /**
   * Gestisce il successo spostando il giocatore in avanti.
   * @param emotionPlayer - Il giocatore che ha indovinato l'emozione.
   * @returns Un oggetto Battle se si verifica una collisione, altrimenti null.
   */
  private handleFilmSuccess(emotionPlayer: Player): Battle | null {
    const result = this.movementManager.movePlayerForward(emotionPlayer);
    return result.collision;
  }

  /**
   * Gestisce il fallimento facendo saltare il turno successivo al giocatore.
   * @param emotionPlayer - Il giocatore che ha sbagliato l'emozione.
   */
  private handleFilmFailure(emotionPlayer: Player): void {
    emotionPlayer.skipNextTurn();
  }
}
