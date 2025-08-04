import { Mime } from "../deck";
import {
  type Command,
  type CommandDependencies,
  SpecialSquare,
} from "./special-square";

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
   * @param dependencies - Oggetto contenente le dipendenze necessarie (player, mimeDeck).
   */
  execute(dependencies: CommandDependencies) {
    const mimePlayer = dependencies.player;
    const card = dependencies.mimeDeck.draw();
    const mimeAction = new Mime(mimePlayer, card);
    return mimeAction;
  }
}
