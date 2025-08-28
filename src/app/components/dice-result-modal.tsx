import type React from "react";
import { useState } from "react";
import type { Battle } from "@/model/battle";
import type { Mime, Quiz } from "@/model/deck";
import type { Player } from "@/model/player";
import Button from "./ui/button";
import Select from "./ui/select";

interface DiceResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  diceResult: number | null;
  actionType: string | null;
  actionData: Battle | Mime | Quiz | null;
  onResolveBattle?: (winnerId: number) => void;
  onResolveMime?: (success: boolean, guessPlayerId?: number) => void;
  onResolveQuiz?: (success: boolean) => void;
  allPlayers: Player[];
}

const H3 = (props: { children: string }) => (
  <h3 className="testo-nero mb-1 font-londrina-solid text-2xl">
    {props.children}
  </h3>
);

const Divider = () => <div className="m-4 border-gray-300 border-b-2"></div>;

const DiceResultModal: React.FC<DiceResultModalProps> = ({
  isOpen,
  onClose,
  diceResult,
  actionType,
  actionData,
  onResolveBattle,
  onResolveMime,
  onResolveQuiz,
  allPlayers,
}) => {
  const [showQuizAnswer, setShowQuizAnswer] = useState(false);
  const [showMimeTopic, setShowMimeTopic] = useState(false);
  const [mimeGuessed, setMimeGuessed] = useState<boolean | null>(null);
  const [mimeGuesserId, setMimeGuesserId] = useState<number | null>(null);

  if (!isOpen) {
    return null;
  }

  const handleWinnerSelection = (winnerId: number) => {
    if (onResolveBattle) {
      onResolveBattle(winnerId);
    }
    onClose();
  };

  const handleShowQuizAnswer = () => {
    setShowQuizAnswer(true);
  };

  const handleQuizResolution = (success: boolean) => {
    if (onResolveQuiz) {
      onResolveQuiz(success);
    }
    setShowQuizAnswer(false);
    onClose();
  };

  const handleMimeResolution = (success: boolean, guesserId?: number) => {
    setMimeGuessed(success);
    setMimeGuesserId(guesserId || null);
    if (onResolveMime) {
      onResolveMime(success, guesserId);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="min-w-[600px] border-4 border-gray-800 bg-white p-6 text-center shadow-lg">
        <h2 className="testo-nero mb-4 font-londrina-solid text-4xl">
          Risultato del Turno
        </h2>
        {diceResult !== null && (
          <p className="mb-4 text-xl">
            Hai tirato un:{" "}
            <span className="font-bold text-blue-600">{diceResult}</span>
          </p>
        )}

        {actionType && <Divider />}

        {actionType === "battle" &&
          actionData &&
          (actionData as Battle).getPlayers && (
            <div className="mt-4">
              <H3>Battaglia!</H3>
              <p className="m-1 text-xl">Seleziona il vincitore</p>
              <div className="flex justify-center space-x-4">
                {(actionData as Battle).getPlayers().map((player: Player) => (
                  <Button
                    key={player.getId()}
                    onClick={() => handleWinnerSelection(player.getId())}
                    color="red"
                  >
                    {player.getName()}
                  </Button>
                ))}
              </div>
            </div>
          )}

        {actionType === "quiz" &&
          actionData &&
          (actionData as Quiz).cardTopic && (
            <div className="mt-4">
              <H3>Quiz!</H3>
              <p className="m-1 text-xl">
                <span className="font-bold">Domanda: </span>
                {(actionData as Quiz).cardTopic.cardTitle}
              </p>
              {!showQuizAnswer && (
                <Button
                  onClick={handleShowQuizAnswer}
                  color="purple"
                  className="mx-auto"
                >
                  Mostra Risposta
                </Button>
              )}
              {showQuizAnswer && (
                <>
                  <p className="mb-1 text-xl">
                    <span className="font-bold">Risposta: </span>
                    {(actionData as Quiz).cardTopic.cardText}
                  </p>
                  <div className="flex justify-center space-x-4">
                    <Button
                      onClick={() => handleQuizResolution(true)}
                      color="green"
                    >
                      Corretto
                    </Button>
                    <Button
                      onClick={() => handleQuizResolution(false)}
                      color="red"
                    >
                      Sbagliato
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}

        {actionType === "mime" &&
          actionData &&
          (actionData as Mime).cardTopic && (
            <div className="mt-4">
              <H3>Mimo!</H3>
              {!showMimeTopic && (
                <Button
                  onClick={() => setShowMimeTopic(true)}
                  color="purple"
                  className="mx-auto"
                >
                  Mostra Mimo
                </Button>
              )}
              {showMimeTopic && (
                <>
                  <p className="mb-1 text-xl">
                    Mima: {(actionData as Mime).cardTopic.cardTitle}
                  </p>
                  <div className="mt-2 flex justify-center space-x-4">
                    <Button
                      onClick={() =>
                        handleMimeResolution(true, mimeGuesserId || undefined)
                      }
                      color="green"
                    >
                      Indovinato
                    </Button>
                    <Button
                      onClick={() => handleMimeResolution(false)}
                      color="red"
                    >
                      Non Indovinato
                    </Button>
                  </div>
                </>
              )}
              {mimeGuessed !== null && mimeGuessed && (
                <div className="mt-2">
                  <H3>Chi ha indovinato?</H3>
                  <Select
                    value={mimeGuesserId || ""}
                    onChange={(e) => setMimeGuesserId(Number(e.target.value))}
                    options={allPlayers
                      .filter(
                        (player) =>
                          player.getId() !==
                          (actionData as Mime).mimePlayer.getId(),
                      )
                      .map((player) => ({
                        value: player.getId(),
                        label: player.getName(),
                      }))}
                    className="m-2"
                  />
                  <Button
                    onClick={() =>
                      handleMimeResolution(true, mimeGuesserId || undefined)
                    }
                    color="blue"
                    className="mx-auto"
                    disabled={mimeGuesserId === null}
                  >
                    Conferma
                  </Button>
                </div>
              )}
            </div>
          )}

        {actionType && <Divider />}
        <Button onClick={onClose} color="blue" className="mx-auto">
          Chiudi
        </Button>
      </div>
    </div>
  );
};

export default DiceResultModal;
