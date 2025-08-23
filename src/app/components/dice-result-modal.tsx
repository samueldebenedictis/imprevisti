import type React from "react";
import { useState } from "react";
import type { Battle } from "@/model/battle";
import type { Mime, Quiz } from "@/model/deck";
import type { Player } from "@/model/player";

interface DiceResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  diceResult: number | null;
  actionType: string | null;
  actionData: Battle | Mime | Quiz | null;
  onResolveBattle?: (winnerId: number) => void;
  onResolveMime?: (success: boolean, guessPlayerId?: number) => void;
  onResolveQuiz?: (success: boolean) => void;
  allPlayers: Player[]; // Added allPlayers prop
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
  allPlayers, // Destructure allPlayers
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
    setShowQuizAnswer(false); // Reset for next time
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
      <div className="bg-white p-6 rounded-lg shadow-lg text-center">
        <h2 className="text-2xl font-bold mb-4">Turn Result</h2>
        {diceResult !== null && (
          <p className="text-xl mb-2">
            You rolled a:{" "}
            <span className="font-extrabold text-blue-600">{diceResult}</span>
          </p>
        )}
        {actionType && (
          <p className="text-lg mb-4">
            Action:{" "}
            <span className="font-semibold text-red-600">{actionType}</span>
          </p>
        )}
        {!actionType && diceResult !== null && (
          <p className="text-lg mb-4">No special action this turn.</p>
        )}

        {actionType === "battle" &&
          actionData &&
          (actionData as Battle).getPlayers && (
            <div className="mt-4">
              <h3 className="text-xl font-semibold mb-2">
                Battle! Choose a winner:
              </h3>
              <div className="flex justify-center space-x-4">
                {(actionData as Battle).getPlayers().map((player: Player) => (
                  <button
                    type="button"
                    key={player.getId()}
                    onClick={() => handleWinnerSelection(player.getId())}
                    className="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    {player.getName()}
                  </button>
                ))}
              </div>
            </div>
          )}

        {actionType === "quiz" &&
          actionData &&
          (actionData as Quiz).cardTopic && (
            <div className="mt-4">
              <h3 className="text-xl font-semibold mb-2">Quiz Time!</h3>
              <p className="text-lg mb-2">
                Question: {(actionData as Quiz).cardTopic.cardTitle}
              </p>
              {!showQuizAnswer && (
                <button
                  type="button"
                  onClick={handleShowQuizAnswer}
                  className="mt-2 px-4 py-2 bg-purple-500 text-white rounded-full hover:bg-purple-600"
                >
                  Show Answer
                </button>
              )}
              {showQuizAnswer && (
                <>
                  <p className="text-lg mb-2">
                    Answer:{" "}
                    <span className="font-bold">
                      {(actionData as Quiz).cardTopic.cardText}
                    </span>
                  </p>
                  <div className="flex justify-center space-x-4 mt-2">
                    <button
                      type="button"
                      onClick={() => handleQuizResolution(true)}
                      className="px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600"
                    >
                      Correct
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuizResolution(false)}
                      className="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      Incorrect
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

        {actionType === "mime" &&
          actionData &&
          (actionData as Mime).cardTopic && (
            <div className="mt-4">
              <h3 className="text-xl font-semibold mb-2">Mime Time!</h3>
              <p className="text-lg mb-2">
                Mime: {(actionData as Mime).cardTopic.cardTitle}
              </p>
              <div className="flex justify-center space-x-4 mt-2">
                <button
                  type="button"
                  onClick={() =>
                    handleMimeResolution(true, mimeGuesserId || undefined)
                  }
                  className="px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600"
                >
                  Guessed
                </button>
                <button
                  type="button"
                  onClick={() => handleMimeResolution(false)}
                  className="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  Not Guessed
                </button>
              </div>
              {mimeGuessed !== null && mimeGuessed && (
                <div className="mt-2">
                  <h4 className="text-md font-semibold mb-1">
                    Who guessed it?
                  </h4>
                  <div className="flex justify-center space-x-2 mt-2">
                    {allPlayers
                      .filter(
                        (player) =>
                          player.getId() !==
                          (actionData as Mime).mimePlayer.getId(),
                      )
                      .map((player: Player) => (
                        <button
                          type="button"
                          key={player.getId()}
                          onClick={() =>
                            handleMimeResolution(true, player.getId())
                          }
                          className="px-3 py-1 bg-blue-400 text-white rounded-full hover:bg-blue-500"
                        >
                          {player.getName()}
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

        <button
          type="button"
          onClick={onClose}
          className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default DiceResultModal;
