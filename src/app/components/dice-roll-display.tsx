import {
  DICE_BUTTON_CONTINUE,
  DICE_BUTTON_ROLL,
  DICE_BUTTON_ROLLING,
  DICE_SKIP_TURN_MESSAGE,
} from "../texts";
import Dice from "./dice";
import Button from "./ui/button";

interface DiceRollComponentProps {
  onRollDice: () => void;
  isRolling: boolean;
  diceResult?: number | null;
  onContinue?: () => void;
  showResult?: boolean;
  currentPlayerName?: string;
}

export default function DiceRollComponent({
  onRollDice,
  isRolling,
  diceResult,
  onContinue,
  showResult = false,
  currentPlayerName,
}: DiceRollComponentProps) {
  const displayResult =
    showResult ||
    (diceResult !== null && diceResult !== undefined && !isRolling);

  return (
    <div className="w-full text-center">
      {/* Skip turn message for dice result 0 - hide dice */}
      {displayResult && diceResult === 0 && currentPlayerName && (
        <div className="mb-2">
          <div className="mb-4">
            <Button onClick={onContinue} color="blue" className="w-full">
              {DICE_BUTTON_CONTINUE}
            </Button>
          </div>
          <p className="ui-text-normal font-bold text-red-600">
            {DICE_SKIP_TURN_MESSAGE(currentPlayerName)}
          </p>
        </div>
      )}

      {/* Normal dice display for results other than 0 */}
      {(!displayResult || diceResult !== 0) && (
        <>
          <div className="mb-2">
            {displayResult ? (
              <Button onClick={onContinue} color="blue" className="w-full">
                {DICE_BUTTON_CONTINUE}
              </Button>
            ) : (
              <Button
                onClick={onRollDice}
                disabled={isRolling}
                color="green"
                className="w-full"
              >
                {isRolling ? DICE_BUTTON_ROLLING : DICE_BUTTON_ROLL}
              </Button>
            )}
          </div>
          <div className="mt-8 flex items-center justify-center">
            <Dice isRolling={isRolling} result={diceResult} />
          </div>
        </>
      )}
    </div>
  );
}
