import { Film, type FilmDeck } from "../deck";
import {
  type Command,
  type CommandDependencies,
  SpecialSquare,
} from "./special-square";

/**
 * Special square for the film game.
 * When a player lands on this square, they watch a film scene drawn from the film deck.
 */
export class FilmSquare extends SpecialSquare {
  constructor(id: number) {
    super(id);
    this.type = "film"; // Specifica il tipo per la serializzazione
  }

  /**
   * Returns the command to execute the film action.
   * @returns Command that handles the film logic.
   */
  getCommand(): Command {
    return new FilmCommand();
  }
}

/**
 * Command that implements the film game logic.
 */
class FilmCommand implements Command {
  /**
   * Executes the film action.
   * The player who lands on the square watches the scene and must guess the emotion it conveys.
   * If the answer is correct, the player advances one square.
   * Otherwise, the player who answered skips the next turn.
   * @param dependencies - Object containing the necessary dependencies (player, filmDeck).
   */
  execute(dependencies: CommandDependencies) {
    const emotionPlayer = dependencies.player;
    const card = (dependencies.filmDeck as FilmDeck).draw();
    const videoData = (dependencies.filmDeck as FilmDeck).getVideoData(card);
    const videoUrl = videoData ? videoData.videoUrl : "";
    return new Film(emotionPlayer, card, videoUrl);
  }
}
