import type { Board } from "../board";
import type { Deck, Mime, Quiz } from "../deck";
import type { BackWrite } from "../deck/backwrite";
import type { Dice } from "../dice";
import type { GameStateManager, MovementManager } from "../managers";
import type { Player } from "../player";
import { Square } from "./square";

// Definire un tipo per le dipendenze che i comandi potrebbero richiedere
export type CommandDependencies = {
  player: Player;
  board: Board;
  allPlayers: Player[];
  mimeDeck: Deck;
  quizDeck: Deck;
  backWriteDeck: Deck;
  dice: Dice;
  movementManager: MovementManager;
  gameStateManager: GameStateManager;
};

/**
 * Interfaccia per il pattern Command utilizzato dalle caselle speciali.
 * Ogni comando implementa la logica specifica per un tipo di casella.
 */
export interface Command {
  /**
   * Esegue il comando utilizzando le dipendenze fornite.
   * @param dependencies - Oggetto contenente tutte le dipendenze necessarie
   */
  execute(
    dependencies: CommandDependencies,
  ): undefined | Mime | Quiz | BackWrite;
}

/**
 * Classe astratta per le caselle speciali del tabellone.
 * Estende la casella base aggiungendo la funzionalità di comando.
 * Utilizza il pattern Command per incapsulare le azioni specifiche.
 */
export abstract class SpecialSquare extends Square {
  /**
   * Restituisce il comando associato a questa casella speciale.
   * Ogni sottoclasse deve implementare questo metodo per definire il proprio comportamento.
   * @returns Il comando da eseguire quando un giocatore atterra su questa casella
   */
  abstract getCommand(): Command;
}
