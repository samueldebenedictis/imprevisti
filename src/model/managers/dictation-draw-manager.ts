import type { Battle } from "../battle";
import type { Player } from "../player";
import type { DictationDraw } from "../square";
import type { MovementManager } from "./movement-manager";

/**
 * Manages the logic for dictation draw games.
 * Handles resolving dictation draw actions and managing consequences.
 */
export class DictationDrawManager {
  /**
   * Creates a new dictation draw manager.
   * @param movementManager - Manager for handling player movement
   */
  constructor(private movementManager: MovementManager) {}

  /**
   * Resolves a dictation draw action, applying effects based on success or failure.
   * @param dictationDrawAction - The DictationDraw object to resolve
   * @param success - True if the drawing was similar, false otherwise
   * @param drawingPlayer - The player who described the drawing (required if success is true)
   * @returns Array with any resulting collisions from player movement
   */
  resolveDictationDraw(
    dictationDrawAction: DictationDraw,
    success: boolean,
    drawingPlayer?: Player,
  ): [Battle | null, Battle | null] {
    if (success && drawingPlayer) {
      return this.handleDictationDrawSuccess(
        dictationDrawAction.drawingPlayer,
        drawingPlayer,
      );
    } else {
      this.handleDictationDrawFailure(dictationDrawAction.drawingPlayer);
      return [null, null];
    }
  }

  /**
   * Handles successful dictation draw by moving both players forward.
   * @param drawingPlayer - The player who described the drawing
   * @param drawingPlayer - The player who drew the image
   * @returns Array with any collisions for both players
   */
  private handleDictationDrawSuccess(
    drawingPlayer: Player,
    drawingPlayer2: Player,
  ): [Battle | null, Battle | null] {
    const [result1, result2] = this.movementManager.moveBothPlayersForward(
      drawingPlayer,
      drawingPlayer2,
    );

    return [result1.collision, result2.collision];
  }

  /**
   * Handles failed dictation draw by making the drawing player skip next turn.
   * @param drawingPlayer - The player who described the drawing
   */
  private handleDictationDrawFailure(drawingPlayer: Player): void {
    drawingPlayer.skipNextTurn();
  }

  /**
   * Validates if a dictation draw action is valid (has all required properties).
   * @param dictationDrawAction - The dictation draw action to validate
   * @returns True if the dictation draw is valid, false otherwise
   */
  isValidDictationDraw(dictationDrawAction: DictationDraw): boolean {
    return !!(
      dictationDrawAction.drawingPlayer && dictationDrawAction.cardTopic
    );
  }
}
