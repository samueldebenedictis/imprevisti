import type React from "react";
import { useState } from "react";
import type { Battle } from "@/model/battle";
import type { Mime, Quiz } from "@/model/deck";
import type { Player } from "@/model/player";
import Button from "./button"; // Import the new Button component

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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white p-6 shadow-lg text-center border-4 border-gray-800">
        <h2 className="font-londrina-solid text-4xl text-gray-800 mb-4">
          Risultato del Turno
        </h2>
        {diceResult !== null && (
          <p className="text-xl mb-1">
            Hai tirato un:{" "}
            <span className="font-extrabold text-blue-600">{diceResult}</span>
          </p>
        )}
        {actionType && (
          <p className="text-xl mb-4">
            Azione:{" "}
            <span className="font-extrabold text-red-600">{actionType}</span>
          </p>
        )}
        {!actionType && diceResult !== null && (
          <p className="text-xl mb-4">
            Nessuna azione speciale in questo turno.
          </p>
        )}

        {actionType === "battle" &&
          actionData &&
          (actionData as Battle).getPlayers && (
            <div className="mt-4">
              <h3 className="font-londrina-solid text-2xl text-gray-700 mb-1">
                Battaglia! Scegli un vincitore:
              </h3>
              <div className="flex justify-center space-x-4">
                {(actionData as Battle).getPlayers().map((player: Player) => (
                  <Button
                    key={player.getId()}
                    onClick={() => handleWinnerSelection(player.getId())}
                    color="red"
                    className="px-4 py-2"
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
              <h3 className="font-londrina-solid text-2xl text-gray-700 mb-1">
                Tempo di Quiz!
              </h3>
              <p className="text-xl mb-1">
                Domanda: {(actionData as Quiz).cardTopic.cardTitle}
              </p>
              {!showQuizAnswer && (
                <Button
                  onClick={handleShowQuizAnswer}
                  color="purple"
                  className="mt-2 px-4 py-2"
                >
                  Mostra Risposta
                </Button>
              )}
              {showQuizAnswer && (
                <>
                  <p className="text-xl mb-1">
                    Risposta:{" "}
                    <span className="font-bold">
                      {(actionData as Quiz).cardTopic.cardText}
                    </span>
                  </p>
                  <div className="flex justify-center space-x-4 mt-2">
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
              <h3 className="font-londrina-solid text-2xl text-gray-700 mb-1">
                Tempo di Mima!
              </h3>
              <p className="text-xl mb-1">
                Mima: {(actionData as Mime).cardTopic.cardTitle}
              </p>
              <div className="flex justify-center space-x-4 mt-2">
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
              {mimeGuessed !== null && mimeGuessed && (
                <div className="mt-2">
                  <h4 className="font-londrina-solid text-xl text-gray-600 mb-1">
                    Chi ha indovinato?
                  </h4>
                  <div className="flex justify-center space-x-2 mt-2">
                    {allPlayers
                      .filter(
                        (player) =>
                          player.getId() !==
                          (actionData as Mime).mimePlayer.getId(),
                      )
                      .map((player: Player) => (
                        <Button
                          key={player.getId()}
                          onClick={() =>
                            handleMimeResolution(true, player.getId())
                          }
                          color="blue"
                          className="px-3 py-1"
                        >
                          {player.getName()}
                        </Button>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

        <Button onClick={onClose} color="blue" className="mt-4 px-6 py-2">
          Chiudi
        </Button>
      </div>
    </div>
  );
};

export default DiceResultModal;
