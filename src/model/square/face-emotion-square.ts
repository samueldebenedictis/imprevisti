import { FaceEmotion, type FaceEmotionDeck } from "../deck";
import {
  type Command,
  type CommandDependencies,
  SpecialSquare,
} from "./special-square";

/**
 * Special square for the face emotion game.
 * When a player lands on this square, they draw a card from the face emotion deck.
 */
export class FaceEmotionSquare extends SpecialSquare {
  constructor(id: number) {
    super(id);
    this.type = "face-emotion"; // Specifica il tipo per la serializzazione
  }

  /**
   * Returns the command to execute the face emotion action.
   * @returns Command that handles the face emotion logic.
   */
  getCommand(): Command {
    return new FaceEmotionCommand();
  }
}

/**
 * Command that implements the face emotion game logic.
 */
class FaceEmotionCommand implements Command {
  /**
   * Executes the face emotion action.
   * The player who lands on the square must guess the emotion shown in the image.
   * If the answer is correct, the player advances one square.
   * Otherwise, the player who answered skips the next turn.
   * @param dependencies - Object containing the necessary dependencies (player, faceEmotionDeck).
   */
  execute(dependencies: CommandDependencies) {
    const emotionPlayer = dependencies.player;
    const card = (dependencies.faceEmotionDeck as FaceEmotionDeck).draw();
    const imageData = (
      dependencies.faceEmotionDeck as FaceEmotionDeck
    ).getImageData(card);
    const imageUrl = imageData ? imageData.imageUrl : "";
    const faceEmotionAction = new FaceEmotion(emotionPlayer, card, imageUrl);
    return faceEmotionAction;
  }
}
