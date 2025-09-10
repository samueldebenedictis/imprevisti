import type React from "react";
import { useEffect, useState } from "react";
import type { Battle } from "@/model/battle";
import type { Mime, Quiz } from "@/model/deck";
import type { Player } from "@/model/player";
import {
  MODAL_BATTLE_TITLE,
  MODAL_BATTLE_WINNER_SELECTION,
  MODAL_CLOSE_BUTTON,
  MODAL_DICE_ROLL_MESSAGE,
  MODAL_MIME_CONFIRM,
  MODAL_MIME_GUESSED,
  MODAL_MIME_HIDE_TOPIC,
  MODAL_MIME_NOT_GUESSED,
  MODAL_MIME_SHOW_TOPIC,
  MODAL_MIME_TITLE,
  MODAL_MIME_TOPIC,
  MODAL_MIME_WHO_GUESSED,
  MODAL_MOVE_BACKWARD,
  MODAL_MOVE_FORWARD,
  MODAL_NEW_POSITION,
  MODAL_QUIZ_ANSWER,
  MODAL_QUIZ_CORRECT,
  MODAL_QUIZ_QUESTION,
  MODAL_QUIZ_SHOW_ANSWER,
  MODAL_QUIZ_TITLE,
  MODAL_QUIZ_WRONG,
  MODAL_SPECIAL_EFFECT,
  MODAL_SPECIAL_SQUARE_MESSAGE,
  MODAL_TITLE_TURN_RESULT,
  MODAL_TOTAL_MOVEMENT,
} from "../texts";
import Button from "./ui/button";
import { Divider } from "./ui/divider";
import Select from "./ui/select";

interface DiceResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  diceResult: number;
  actionType: string | null;
  actionData: Battle | Mime | Quiz | null;
  onResolveBattle?: (winnerId: number) => void;
  onResolveMime?: (success: boolean, guessPlayerId?: number) => void;
  onResolveQuiz?: (success: boolean) => void;
  allPlayers: Player[];
  currentPlayerName: string;
  startPosition?: number;
  newPosition?: number;
  boardSize?: number;
}

const H3 = (props: { children: string }) => (
  <h3 className="ui-text-dark ui-text-subtitle">{props.children}</h3>
);

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
  currentPlayerName,
  startPosition,
  newPosition,
  boardSize,
}) => {
  const [showQuizAnswer, setShowQuizAnswer] = useState(false);
  const [showMimeTopic, setShowMimeTopic] = useState(false);
  const [mimeGuessed, setMimeGuessed] = useState<boolean | null>(null);
  const [mimeGuesserId, setMimeGuesserId] = useState<number | null>(null);

  // Reset della parte relativa al mimo
  useEffect(() => {
    if (isOpen && actionType === "mime") {
      setShowMimeTopic(false);
      setMimeGuessed(null);
      setMimeGuesserId(null);
    }
  }, [isOpen, actionType]);

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

    // Mimo indovinato ma giocatore che ha indovinato non ancora selezionato
    if (success && guesserId === undefined) {
      return;
    }

    // Mimo non indovinato o
    // Mimo indovinato e giocatore selezionato
    if (onResolveMime) {
      onResolveMime(success, guesserId);
    }
    onClose();
  };

  // Crea il div per informare del movimento se si è atterrati su una casella speciale
  const renderSpecialEffect = () => {
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
            <p className="ui-text-dark">
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="ui-border-dark min-w-[600px] bg-white p-6 text-center shadow-lg">
        <h2 className="ui-text-dark ui-text-title mb-4">
          {MODAL_TITLE_TURN_RESULT}
        </h2>

        {diceResult !== null && !(diceResult === 0 && actionType === null) && (
          <p className="mb-1 text-xl">
            <span className="font-extrabold text-blue-600">
              {currentPlayerName}
            </span>{" "}
            {MODAL_DICE_ROLL_MESSAGE}
            <span className="font-extrabold text-blue-600">
              {diceResult}
            </span>{" "}
          </p>
        )}

        {newPosition !== undefined &&
          startPosition !== undefined &&
          !(diceResult === 0 && actionType === null) && (
            <p className="mb-1 text-xl">
              {MODAL_NEW_POSITION}{" "}
              <span className="font-extrabold text-blue-600">
                {newPosition}
              </span>
            </p>
          )}

        {renderSpecialEffect()}

        {actionType && <Divider />}

        {actionType === "battle" &&
          actionData &&
          (actionData as Battle).getPlayers && (
            <div className="mt-4">
              <H3>{MODAL_BATTLE_TITLE}</H3>
              <p className="m-1 text-xl">{MODAL_BATTLE_WINNER_SELECTION}</p>
              <div className="flex justify-center space-x-4">
                {(actionData as Battle)
                  .getPlayers()
                  .map((oldPlayer: Player) => {
                    const currentPlayer = allPlayers.find(
                      (p) => p.getId() === oldPlayer.getId(),
                    );
                    return currentPlayer ? (
                      <Button
                        key={currentPlayer.getId()}
                        onClick={() =>
                          handleWinnerSelection(currentPlayer.getId())
                        }
                        color="red"
                      >
                        {currentPlayer.getName()}
                      </Button>
                    ) : null;
                  })}
              </div>
            </div>
          )}

        {actionType === "quiz" &&
          actionData &&
          (actionData as Quiz).cardTopic && (
            <div className="mt-4">
              <H3>{MODAL_QUIZ_TITLE}</H3>
              <p className="m-1 text-xl">
                <span className="font-bold">{MODAL_QUIZ_QUESTION} </span>
                {(actionData as Quiz).cardTopic.cardTitle}
              </p>
              {!showQuizAnswer && (
                <Button
                  onClick={handleShowQuizAnswer}
                  color="purple"
                  className="mx-auto"
                >
                  {MODAL_QUIZ_SHOW_ANSWER}
                </Button>
              )}
              {showQuizAnswer && (
                <>
                  <p className="mb-1 text-xl">
                    <span className="font-bold">{MODAL_QUIZ_ANSWER} </span>
                    {(actionData as Quiz).cardTopic.cardText}
                  </p>
                  <div className="flex justify-center space-x-4">
                    <Button
                      onClick={() => handleQuizResolution(true)}
                      color="green"
                    >
                      {MODAL_QUIZ_CORRECT}
                    </Button>
                    <Button
                      onClick={() => handleQuizResolution(false)}
                      color="red"
                    >
                      {MODAL_QUIZ_WRONG}
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
              <H3>{MODAL_MIME_TITLE}</H3>
              {!showMimeTopic && (
                <Button
                  onClick={() => setShowMimeTopic(true)}
                  color="purple"
                  className="mx-auto"
                >
                  {MODAL_MIME_SHOW_TOPIC}
                </Button>
              )}
              {showMimeTopic && (
                <>
                  <p className="mb-1 text-xl">
                    {MODAL_MIME_TOPIC}{" "}
                    <span className="font-bold">
                      {(actionData as Mime).cardTopic.cardTitle}
                    </span>
                  </p>
                  <Button
                    onClick={() => setShowMimeTopic(false)}
                    color="purple"
                    className="mx-auto"
                  >
                    {MODAL_MIME_HIDE_TOPIC}
                  </Button>
                  <div className="mt-2 flex justify-center space-x-4">
                    <Button
                      onClick={() =>
                        handleMimeResolution(
                          true,
                          mimeGuesserId !== null ? mimeGuesserId : undefined,
                        )
                      }
                      color="green"
                    >
                      {MODAL_MIME_GUESSED}
                    </Button>
                    <Button
                      onClick={() => handleMimeResolution(false)}
                      color="red"
                    >
                      {MODAL_MIME_NOT_GUESSED}
                    </Button>
                  </div>
                </>
              )}
              {mimeGuessed !== null && mimeGuessed && (
                <div className="mt-2">
                  <H3>{MODAL_MIME_WHO_GUESSED}</H3>
                  <Select
                    value={
                      mimeGuesserId !== null ? mimeGuesserId.toString() : ""
                    }
                    onChange={(e) => setMimeGuesserId(Number(e.target.value))}
                    options={allPlayers
                      .filter((player) => {
                        // Trova il mimePlayer corrente in allPlayers per evitare problemi di riferimento
                        const currentMimePlayer = allPlayers.find(
                          (p) =>
                            p.getId() ===
                            (actionData as Mime).mimePlayer.getId(),
                        );
                        return currentMimePlayer
                          ? player.getId() !== currentMimePlayer.getId()
                          : true;
                      })
                      .map((player) => ({
                        value: player.getId(),
                        label: player.getName(),
                      }))}
                    className="m-2"
                    placeholder="Seleziona un giocatore"
                  />
                  <Button
                    onClick={() =>
                      handleMimeResolution(
                        true,
                        mimeGuesserId !== null ? mimeGuesserId : undefined,
                      )
                    }
                    color="blue"
                    className="mx-auto"
                    disabled={mimeGuesserId === null}
                  >
                    {MODAL_MIME_CONFIRM}
                  </Button>
                </div>
              )}
            </div>
          )}

        <Divider />
        <Button onClick={onClose} color="blue" className="mx-auto">
          {MODAL_CLOSE_BUTTON}
        </Button>
      </div>
    </div>
  );
};

export default DiceResultModal;
