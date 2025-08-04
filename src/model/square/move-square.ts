import {
  type Command,
  type CommandDependencies,
  SpecialSquare,
} from "./special-square";

/**
 * Casella speciale che sposta il giocatore di un numero specificato di posizioni.
 * Può spostare il giocatore in avanti (valore positivo) o indietro (valore negativo).
 */
export class MoveSquare extends SpecialSquare {
  moveValue: number;

  /**
   * Crea una nuova casella di movimento.
   * @param id - Numero identificativo della casella
   * @param moveValue - Numero di posizioni di cui spostare il giocatore (positivo = avanti, negativo = indietro)
   */
  constructor(id: number, moveValue: number) {
    super(id);
    this.moveValue = moveValue;
  }

  /**
   * Restituisce il valore di movimento della casella.
   * @returns Numero di posizioni di cui spostare il giocatore
   */
  getValue() {
    return this.moveValue;
  }

  /**
   * Restituisce il comando per spostare il giocatore.
   * @returns Comando che esegue il movimento del giocatore
   */
  getCommand(): Command {
    return new MovePlayerCommand(this.moveValue);
  }
}

/**
 * Casella speciale che riporta il giocatore alla casella di partenza (posizione 0).
 * Estende MoveSquare calcolando automaticamente il valore negativo necessario.
 */
export class GoToStartSquare extends MoveSquare {
  /**
   * Crea una nuova casella "vai all'inizio".
   * @param id - Numero identificativo della casella
   */
  constructor(id: number) {
    super(id, -id);
  }
}

/**
 * Comando che implementa il movimento del giocatore.
 * Calcola la nuova posizione e sposta il giocatore sul tabellone.
 */
class MovePlayerCommand implements Command {
  /**
   * Crea un nuovo comando di movimento.
   * @param moveValue - Numero di posizioni di cui spostare il giocatore
   */
  constructor(private moveValue: number) {}

  /**
   * Esegue il movimento del giocatore utilizzando il MovementManager.
   * Calcola la nuova posizione basata sulla posizione corrente e il valore di movimento.
   * @param dependencies - Oggetto contenente le dipendenze necessarie (board, player, movementManager).
   * @returns undefined (nessun mimo da gestire)
   */
  execute(dependencies: CommandDependencies): undefined {
    const currentPosition = dependencies.board.getPlayerPosition(
      dependencies.player,
    ) as number;
    const newPosition = Math.max(0, currentPosition + this.moveValue);

    // Utilizza il MovementManager per gestire il movimento
    // Nota: per le caselle speciali non gestiamo collisioni o fine gioco qui
    // poiché sono già gestite dal flusso principale del gioco
    dependencies.movementManager.movePlayerAndCheckCollision(
      dependencies.player,
      newPosition,
    );

    return undefined;
  }
}
