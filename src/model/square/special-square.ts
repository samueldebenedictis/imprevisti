import type { Mime } from "../deck/mime";
import type { Quiz } from "../deck/quiz";
import type { GameContext } from "../gameContext";
import { Square } from "./square";

/**
 * Interfaccia per il pattern Command utilizzato dalle caselle speciali.
 * Ogni comando implementa la logica specifica per un tipo di casella.
 */
export interface Command {
  /**
   * Esegue il comando utilizzando il contesto di gioco fornito.
   * @param context - Contesto di gioco contenente tutte le informazioni necessarie
   */
  execute(context: GameContext): undefined | Mime | Quiz;
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
