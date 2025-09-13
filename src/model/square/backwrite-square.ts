import { BackWrite } from "../deck/backwrite";
import {
  type Command,
  type CommandDependencies,
  SpecialSquare,
} from "./special-square";

/**
 * Casella speciale per il gioco dello scrivere sulla schiena.
 * Quando un giocatore atterra su questa casella, pesca una carta dal mazzo.
 */
export class BackWriteSquare extends SpecialSquare {
  constructor(id: number) {
    super(id);
    this.type = "backwrite"; // Specifica il tipo per la serializzazione
  }

  /**
   * Restituisce il comando per eseguire l'azione dello scrivere sulla schiena.
   * @returns Comando che gestisce la logica dello scrivere sulla schiena
   */
  getCommand(): Command {
    return new BackWriteCommand();
  }
}

/**
 * Comando che implementa la logica del gioco dello scrivere sulla schiena.
 */
class BackWriteCommand implements Command {
  /**
   * Esegue l'azione dello scrivere sulla schiena.
   * Il giocatore che atterra sulla casella deve scrivere una parola sulla schiena di un altro giocatore.
   * Se la parola è indovinata da un altro giocatore, entrambi avanzano di una casella.
   * Altrimenti, il giocatore che ha scritto salta il prossimo turno.
   * @param dependencies - Oggetto contenente le dipendenze necessarie (player, backWriteDeck).
   */
  execute(dependencies: CommandDependencies) {
    const backWritePlayer = dependencies.player;
    const card = dependencies.backWriteDeck.draw();
    const backWriteAction = new BackWrite(backWritePlayer, card);
    return backWriteAction;
  }
}
