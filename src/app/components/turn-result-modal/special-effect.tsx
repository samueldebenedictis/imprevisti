import type React from "react";
import {
  MODAL_MOVE_BACKWARD,
  MODAL_MOVE_FORWARD,
  MODAL_SPECIAL_EFFECT,
  MODAL_SPECIAL_SQUARE_MESSAGE,
  MODAL_TOTAL_MOVEMENT,
} from "../../texts";
import { Divider } from "../ui/divider";

interface SpecialEffectProps {
  diceResult: number;
  newPosition?: number;
  startPosition?: number;
  boardSize?: number;
}

const SpecialEffect: React.FC<SpecialEffectProps> = ({
  diceResult,
  newPosition,
  startPosition,
  boardSize,
}) => {
  if (
    newPosition !== undefined &&
    startPosition !== undefined &&
    diceResult !== null &&
    boardSize !== undefined
  ) {
    // Calcola la posizione dopo il lancio normale del dado, rispettando i confini del tabellone
    const normalPosition = Math.min(
      Math.max(0, startPosition + diceResult),
      boardSize - 1,
    );
    if (newPosition !== normalPosition) {
      const moveValue = newPosition - normalPosition;
      const effect = moveValue > 0 ? MODAL_MOVE_FORWARD : MODAL_MOVE_BACKWARD;
      const specialEffectMessage = `${MODAL_SPECIAL_SQUARE_MESSAGE}${effect}`;
      const specialColor = (move: number) =>
        move > 0 ? `text-blue-600` : `text-red-600`;
      return (
        <div className="text-xl">
          <Divider />
          <p className={`font-extrabold ${specialColor(moveValue)}`}>
            {MODAL_SPECIAL_EFFECT}
          </p>

          <p className="ui-text-dark">
            {specialEffectMessage}
            <span className={`font-bold text-xl ${specialColor(moveValue)}`}>
              {Math.abs(moveValue)}
            </span>
          </p>
          <p className="ui-text-dark font-bold">
            {MODAL_TOTAL_MOVEMENT}{" "}
            <span
              className={`font-bold text-xl ${specialColor(newPosition - startPosition)}`}
            >
              {newPosition - startPosition}
            </span>
          </p>
        </div>
      );
    }
  }
  return null;
};

export default SpecialEffect;
