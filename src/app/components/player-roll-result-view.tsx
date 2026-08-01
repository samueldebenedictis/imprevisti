import type { LastMoveInfo } from "@/types/session";
import { ACTION_LABELS } from "./action-labels";
import Dice from "./dice";
import Button from "./ui/button";

type PlayerRollResultViewProps = {
  diceResult: number;
  moveInfo: LastMoveInfo | null;
  onContinue: () => void;
};

export default function PlayerRollResultView(props: PlayerRollResultViewProps) {
  const skipTurn = props.diceResult === 0;

  return (
    <div className="ui-text-dark my-8 flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
      {skipTurn ? (
        <p className="ui-text-subtitle text-red-600">Turno saltato!</p>
      ) : (
        <>
          <Dice isRolling={false} result={props.diceResult} />
          <p className="ui-text-subtitle">
            Hai tirato un <strong>{props.diceResult}</strong>!
          </p>
          {props.moveInfo && (
            <div className="ui-border-dark w-full max-w-sm bg-gray-100 p-4 text-center">
              <p className="ui-text-normal">
                Sei atterrato sulla casella{" "}
                <strong>{props.moveInfo.squareNumber}</strong>
                {props.moveInfo.squareType !== "normal" &&
                  props.moveInfo.squareType !== "move" && (
                    <>
                      {" "}
                      ·{" "}
                      {ACTION_LABELS[props.moveInfo.squareType] ??
                        props.moveInfo.squareType}
                    </>
                  )}
              </p>
            </div>
          )}
        </>
      )}
      <Button
        color="blue"
        onClick={props.onContinue}
        className="mx-0 w-full max-w-sm"
      >
        Avanti
      </Button>
    </div>
  );
}
