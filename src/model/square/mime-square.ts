import type { GameContext } from "../gameContext";
import { type Command, SpecialSquare } from "./special-square";

/**
 * Casella speciale per il gioco del mimo.
 * Quando un giocatore atterra su questa casella, pesca una carta dal mazzo.
 */
export class Mime extends SpecialSquare {
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
 * Attualmente pesca una carta dal mazzo quando eseguito.
 */
class MimeCommand implements Command {
  /**
   * Esegue l'azione del mimo pescando una carta dal mazzo.
   * @param context - Contesto di gioco contenente il mazzo di carte
   */
  execute(context: GameContext): void {
    const _card = context.deck.draw();
  }
}
