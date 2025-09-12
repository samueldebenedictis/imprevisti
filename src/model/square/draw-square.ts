import { Draw } from "../deck";
import {
  type Command,
  type CommandDependencies,
  SpecialSquare,
} from "./special-square";

/**
 * Casella speciale per il gioco del disegno.
 * Quando un giocatore atterra su questa casella, pesca una carta dal mazzo.
 */
export class DrawSquare extends SpecialSquare {
  constructor(id: number) {
    super(id);
    this.type = "draw"; // Specifica il tipo per la serializzazione
  }

  /**
   * Restituisce il comando per eseguire l'azione del disegno.
   * @returns Comando che gestisce la logica del disegno
   */
  getCommand(): Command {
    return new DrawCommand();
  }
}

/**
 * Comando che implementa la logica del gioco del disegno.
 */
class DrawCommand implements Command {
  /**
   * Esegue l'azione del disegno.
   * Il giocatore che atterra sulla casella deve disegnare una parola.
   * Se la parola è indovinata da un altro giocatore, entrambi avanzano di una casella.
   * Altrimenti, il giocatore che ha disegnato salta il prossimo turno.
   * @param dependencies - Oggetto contenente le dipendenze necessarie (player, drawDeck).
   */
  execute(dependencies: CommandDependencies) {
    const drawPlayer = dependencies.player;
    const card = dependencies.drawDeck.draw();
    const drawAction = new Draw(drawPlayer, card);
    return drawAction;
  }
}
