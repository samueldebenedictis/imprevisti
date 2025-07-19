import { Mime } from "../deck";
import type { GameContext } from "../gameContext";
import { type Command, SpecialSquare } from "./special-square";

/**
 * Casella speciale per il gioco del mimo.
 * Quando un giocatore atterra su questa casella, pesca una carta dal mazzo.
 */
export class MimeSquare extends SpecialSquare {
  /**
   * Restituisce il comando per eseguire l'azione del mimo.
   * @returns Comando che gestisce la logica del mimo
   */
  getCommand(): Command {
    return new MimeCommand();
  }
}

/**
 * Comando che implementa la logica del gioco del mimo.
 */
class MimeCommand implements Command {
  /**
   * Esegue l'azione del mimo.
   * Il giocatore che atterra sulla casella deve eseguire un mimo.
   * Se il mimo è indovinato da un altro giocatore, entrambi avanzano di una casella.
   * Altrimenti, il giocatore che ha mimato salta il prossimo turno.
   * @param context - Contesto di gioco contenente il giocatore attuale, il mazzo di carte e l'istanza del gioco.
   */
  execute(context: GameContext) {
    const mimePlayer = context.player;
    const card = context.mimeDeck.draw();
    const mimeAction = new Mime(mimePlayer, card);
    return mimeAction;
  }
}
