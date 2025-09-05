import type { Battle } from "../battle";
import type { Player } from "../player";
import type { Quiz } from "../square";
import type { MovementManager } from "./movement-manager";

/**
 * Gestisce la logica per i quiz nel gioco.
 * Risolve le azioni dei quiz e gestisce le conseguenze.
 */
export class QuizManager {
  /**
   * Crea un nuovo gestore di quiz.
   * @param movementManager - Il gestore dei movimenti per muovere i giocatori.
   */
  constructor(private movementManager: MovementManager) {}

  /**
   * Risolve un'azione quiz, applicando effetti in base al successo o al fallimento.
   * @param quizAction - L'oggetto Quiz da risolvere.
   * @param success - True se la risposta al quiz è corretta, altrimenti false.
   * @returns Un oggetto Battle se si verifica una collisione come risultato del movimento, altrimenti null.
   */
  resolveQuiz(quizAction: Quiz, success: boolean): Battle | null {
    if (success) {
      return this.handleQuizSuccess(quizAction.quizPlayer);
    } else {
      this.handleQuizFailure(quizAction.quizPlayer);
      return null;
    }
  }

  /**
   * Gestisce il successo del quiz spostando il giocatore in avanti.
   * @param quizPlayer - Il giocatore che ha risposto correttamente al quiz.
   * @returns Un oggetto Battle se si verifica una collisione, altrimenti null.
   */
  private handleQuizSuccess(quizPlayer: Player): Battle | null {
    const result = this.movementManager.movePlayerForward(quizPlayer);
    return result.collision;
  }

  /**
   * Gestisce il fallimento del quiz facendo saltare il turno successivo al giocatore.
   * @param quizPlayer - Il giocatore che ha sbagliato il quiz.
   */
  private handleQuizFailure(quizPlayer: Player): void {
    quizPlayer.skipNextTurn();
  }
}
