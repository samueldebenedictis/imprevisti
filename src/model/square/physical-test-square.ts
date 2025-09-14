import { PhysicalTest } from "../deck/physical-test";
import {
  type Command,
  type CommandDependencies,
  SpecialSquare,
} from "./special-square";

/**
 * Casella speciale per il gioco dei test fisici.
 * Quando un giocatore atterra su questa casella, pesca una carta dal mazzo.
 */
export class PhysicalTestSquare extends SpecialSquare {
  constructor(id: number) {
    super(id);
    this.type = "physical-test"; // Specifica il tipo per la serializzazione
  }

  /**
   * Restituisce il comando per eseguire l'azione dei test fisici.
   * @returns Comando che gestisce la logica dei test fisici
   */
  getCommand(): Command {
    return new PhysicalTestCommand();
  }
}

/**
 * Comando che implementa la logica del gioco dei test fisici.
 */
class PhysicalTestCommand implements Command {
  /**
   * Esegue l'azione dei test fisici.
   * Il giocatore che atterra sulla casella deve eseguire un test fisico.
   * Se il test è completato correttamente dagli altri giocatori, il giocatore avanza di una casella.
   * Altrimenti, salta il prossimo turno.
   * @param dependencies - Oggetto contenente le dipendenze necessarie (player, physicalTestDeck).
   */
  execute(dependencies: CommandDependencies) {
    const physicalTestPlayer = dependencies.player;
    const card = dependencies.physicalTestDeck.draw();
    const physicalTestAction = new PhysicalTest(physicalTestPlayer, card);
    return physicalTestAction;
  }
}
