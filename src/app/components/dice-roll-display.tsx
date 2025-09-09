import {
  DICE_BUTTON_CONTINUE,
  DICE_BUTTON_ROLL,
  DICE_BUTTON_ROLLING,
  DICE_BUTTON_SKIP_TURN,
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
  mustSkipTurn?: boolean;
}

export default function DiceRollComponent({
  onRollDice,
  isRolling,
  diceResult,
  onContinue,
  showResult = false,
  currentPlayerName,
  mustSkipTurn = false,
}: DiceRollComponentProps) {
  const displayResult =
    showResult ||
    (diceResult !== null && diceResult !== undefined && !isRolling);

  return (
    <div className="w-full text-center">
      {/* Il giocatore deve saltare il turno: mostro il button salta turno */}
      {mustSkipTurn && (
        <div className="mb-2">
          <Button onClick={onRollDice} color="red" className="w-full">
            {DICE_BUTTON_SKIP_TURN}
          </Button>
        </div>
      )}

      {/* Quando il giocatore ha saltato il turno, mostro il tasto continua e il messaggio del turno skippato */}
      {!mustSkipTurn &&
        displayResult &&
        diceResult === 0 &&
        currentPlayerName && (
          <div className="mb-2">
            <div className="mb-4">
              <Button onClick={onContinue} color="blue" className="w-full">
                {DICE_BUTTON_CONTINUE}
              </Button>
            </div>
            <p className="ui-text-normal text-red-600">
              {DICE_SKIP_TURN_MESSAGE(currentPlayerName)}
            </p>
          </div>
        )}

      {/* Situazione normale */}
      {!mustSkipTurn && (!displayResult || diceResult !== 0) && (
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
