import { MusicEmotion } from "../deck/music-emotion";
import {
  type Command,
  type CommandDependencies,
  SpecialSquare,
} from "./special-square";

/**
 * Casella speciale per il gioco della musica emozioni.
 * Quando un giocatore atterra su questa casella, pesca una carta dal mazzo.
 */
export class MusicEmotionSquare extends SpecialSquare {
  constructor(id: number) {
    super(id);
    this.type = "music-emotion"; // Specifica il tipo per la serializzazione
  }

  /**
   * Restituisce il comando per eseguire l'azione della musica emozioni.
   * @returns Comando che gestisce la logica della musica emozioni
   */
  getCommand(): Command {
    return new MusicEmotionCommand();
  }
}

/**
 * Comando che implementa la logica del gioco della musica emozioni.
 */
class MusicEmotionCommand implements Command {
  /**
   * Esegue l'azione della musica emozioni.
   * Il giocatore che atterra sulla casella deve esprimere l'emozione con una canzone.
   * Se l'emozione è indovinata dagli altri giocatori, il giocatore avanza di una casella.
   * Altrimenti, salta il prossimo turno.
   * @param dependencies - Oggetto contenente le dipendenze necessarie (player, musicEmotionDeck).
   */
  execute(dependencies: CommandDependencies) {
    const musicEmotionPlayer = dependencies.player;
    const card = dependencies.musicEmotionDeck.draw();
    const musicEmotionAction = new MusicEmotion(musicEmotionPlayer, card);
    return musicEmotionAction;
  }
}
