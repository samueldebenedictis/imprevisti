import Dice from "./dice";
import Button from "./ui/button";

type PlayerRollViewProps = {
  isRolling: boolean;
  onRollDice: () => void;
};

export default function PlayerRollView(props: PlayerRollViewProps) {
  return (
    <div className="ui-text-dark my-8 flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <p className="ui-text-subtitle">È il tuo turno!</p>
      <button
        type="button"
        disabled={props.isRolling}
        className="mt-4 flex items-center justify-center disabled:cursor-default"
        onClick={!props.isRolling ? props.onRollDice : undefined}
      >
        <Dice isRolling={props.isRolling} result={null} />
      </button>
      <Button
        color="green"
        onClick={props.onRollDice}
        disabled={props.isRolling}
        className="mx-0 w-full max-w-sm"
      >
        {props.isRolling ? "Lancio..." : "Lancia il dado"}
      </Button>
    </div>
  );
}
