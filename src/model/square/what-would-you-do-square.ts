import { WhatWouldYouDo } from "../deck/what-would-you-do";
import {
  type Command,
  type CommandDependencies,
  SpecialSquare,
} from "./special-square";

/**
 * Casella speciale per il gioco delle domande "cosa faresti se".
 * Quando un giocatore atterra su questa casella, pesca una carta dal mazzo.
 */
export class WhatWouldYouDoSquare extends SpecialSquare {
  constructor(id: number) {
    super(id);
    this.type = "what-would-you-do"; // Specifica il tipo per la serializzazione
  }

  /**
   * Restituisce il comando per eseguire l'azione delle domande "cosa faresti se".
   * @returns Comando che gestisce la logica delle domande "cosa faresti se"
   */
  getCommand(): Command {
    return new WhatWouldYouDoCommand();
  }
}

/**
 * Comando che implementa la logica del gioco delle domande "cosa faresti se".
 */
class WhatWouldYouDoCommand implements Command {
  /**
   * Esegue l'azione delle domande "cosa faresti se".
   * Il giocatore che atterra sulla casella deve rispondere a una domanda ipotetica.
   * Se la risposta convince gli altri giocatori, il giocatore avanza di una casella.
   * Altrimenti, salta il prossimo turno.
   * @param dependencies - Oggetto contenente le dipendenze necessarie (player, whatWouldYouDoDeck).
   */
  execute(dependencies: CommandDependencies) {
    const whatWouldYouDoPlayer = dependencies.player;
    const card = dependencies.whatWouldYouDoDeck.draw();
    const whatWouldYouDoAction = new WhatWouldYouDo(whatWouldYouDoPlayer, card);
    return whatWouldYouDoAction;
  }
}
