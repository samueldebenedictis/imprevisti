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
  const [showMimeTopic, setShowMimeTopic] = useState(false); // New state for mime topic visibility
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
      <div className="border-4 border-gray-800 bg-white p-6 text-center shadow-lg">
        <h2 className="testo-nero mb-4 font-londrina-solid text-4xl">
          Risultato del Turno
        </h2>
        {diceResult !== null && (
          <p className="mb-1 text-xl">
            Hai tirato un:{" "}
            <span className="font-extrabold text-blue-600">{diceResult}</span>
          </p>
        )}
        {/* {actionType && (
          <p className="mb-4 text-xl">
            Azione:{" "}
            <span className="font-extrabold text-red-600">{actionType}</span>
          </p>
        )}
        {!actionType && diceResult !== null && (
          <p className="mb-4 text-xl">
            Nessuna azione speciale in questo turno.
          </p>
        )} */}

        {actionType === "battle" &&
          actionData &&
          (actionData as Battle).getPlayers && (
            <div className="mt-4">
              <h3 className="testo-nero mb-1 font-londrina-solid text-2xl">
                Battaglia! Scegli un vincitore:
              </h3>
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
              <h3 className="testo-nero mb-1 font-londrina-solid text-2xl">
                Quiz!
              </h3>
              <p className="mb-1 text-xl">
                Domanda: {(actionData as Quiz).cardTopic.cardTitle}
              </p>
              {!showQuizAnswer && (
                <Button
                  onClick={handleShowQuizAnswer}
                  color="purple"
                  className="m-2 mx-auto"
                >
                  Mostra Risposta
                </Button>
              )}
              {showQuizAnswer && (
                <>
                  <p className="mb-1 text-xl">
                    Risposta:{" "}
                    <span className="font-bold">
                      {(actionData as Quiz).cardTopic.cardText}
                    </span>
                  </p>
                  <div className="mt-2 flex justify-center space-x-4">
                    <Button
                      onClick={() => handleQuizResolution(true)}
                      color="green"
                      className="px-4 py-2"
                    >
                      Corretto
                    </Button>
                    <Button
                      onClick={() => handleQuizResolution(false)}
                      color="red"
                      className="px-4 py-2"
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
              <h3 className="testo-nero mb-1 font-londrina-solid text-2xl">
                Tempo di Mima!
              </h3>
              {!showMimeTopic && (
                <Button
                  onClick={() => setShowMimeTopic(true)}
                  color="purple"
                  className="mx-auto mt-2 px-4 py-2"
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
                      className="px-4 py-2"
                    >
                      Indovinato
                    </Button>
                    <Button
                      onClick={() => handleMimeResolution(false)}
                      color="red"
                      className="px-4 py-2"
                    >
                      Non Indovinato
                    </Button>
                  </div>
                </>
              )}
              {mimeGuessed !== null && mimeGuessed && (
                <div className="mt-2">
                  <h4 className="testo-nero mb-1 font-londrina-solid text-xl">
                    Chi ha indovinato?
                  </h4>
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
                    className="mt-2"
                  />
                  <Button
                    onClick={() =>
                      handleMimeResolution(true, mimeGuesserId || undefined)
                    }
                    color="blue"
                    className="mx-auto mt-2 px-3 py-1"
                    disabled={mimeGuesserId === null}
                  >
                    Conferma
                  </Button>
                </div>
              )}
            </div>
          )}

        <Button
          onClick={onClose}
          color="blue"
          className="mx-auto mt-4 px-6 py-2"
        >
          Chiudi
        </Button>
      </div>
    </div>
  );
};

export default DiceResultModal;
