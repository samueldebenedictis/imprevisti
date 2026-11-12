import { EmotionVideo, type EmotionVideoDeck } from "../deck";
import {
  type Command,
  type CommandDependencies,
  SpecialSquare,
} from "./special-square";

/**
 * Special square for the film game.
 * When a player lands on this square, they watch a film scene drawn from the film deck.
 */
export class EmotionVideoSquare extends SpecialSquare {
  constructor(id: number) {
    super(id);
    this.type = "emotion-video"; // Specifica il tipo per la serializzazione
  }

  /**
   * Returns the command to execute the film action.
   * @returns Command that handles the film logic.
   */
  getCommand(): Command {
    return new EmotionVideoCommand();
  }
}

/**
 * Command that implements the film game logic.
 */
class EmotionVideoCommand implements Command {
  /**
   * Executes the film action.
   * The player who lands on the square watches the scene and must guess the emotion it conveys.
   * If the answer is correct, the player advances one square.
   * Otherwise, the player who answered skips the next turn.
   * @param dependencies - Object containing the necessary dependencies (player, emotionVideoDeck).
   */
  execute(dependencies: CommandDependencies) {
    const emotionPlayer = dependencies.player;
    const card = (dependencies.emotionVideoDeck as EmotionVideoDeck).draw();
    const videoData = (
      dependencies.emotionVideoDeck as EmotionVideoDeck
    ).getVideoData(card);
    const videoUrl = videoData ? videoData.videoUrl : "";
    return new EmotionVideo(emotionPlayer, card, videoUrl);
  }
}
