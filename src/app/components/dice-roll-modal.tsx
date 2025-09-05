import Button from "./ui/button";

interface DiceRollModalProps {
  isOpen: boolean;
  onRollDice: () => void;
  isRolling: boolean;
  diceResult?: number | null;
  onContinue?: () => void;
}

const _H3 = (props: { children: string }) => (
  <h3 className="ui-text-dark ui-text-subtitle">{props.children}</h3>
);

export default function DiceRollModal({
  isOpen,
  onRollDice,
  isRolling,
  diceResult,
  onContinue,
}: DiceRollModalProps) {
  if (!isOpen) return null;

  const showResult =
    diceResult !== null && diceResult !== undefined && !isRolling;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="ui-border-dark min-w-[600px] bg-white p-6 text-center shadow-lg">
        <h2 className="ui-text-dark ui-text-title mb-4">
          {showResult ? "Risultato del dado" : "Lancia il dado"}
        </h2>
        <div className="mb-4 flex items-center justify-center">
          {showResult ? (
            <div className="ui-text-title text-7xl">{diceResult}</div>
          ) : (
            <div
              className={`text-6xl ${isRolling ? "animate-spin" : ""}`}
              style={{ animationDuration: "0.5s" }}
            >
              🎲
            </div>
          )}
        </div>
        <div className="flex justify-center">
          {showResult ? (
            <Button onClick={onContinue} color="blue">
              Continua
            </Button>
          ) : (
            <Button onClick={onRollDice} disabled={isRolling} color="green">
              {isRolling ? "Lanciando..." : "Lancia il dado"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
