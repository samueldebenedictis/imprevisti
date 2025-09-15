import type React from "react";
import { useEffect, useState } from "react";
import type { BackWrite } from "@/model/deck";
import type { Player } from "@/model/player";
import {
  LABEL_SELECT_PLAYER,
  MODAL_BACKWRITE_CONFIRM,
  MODAL_BACKWRITE_GUESSED,
  MODAL_BACKWRITE_HIDE_WORD,
  MODAL_BACKWRITE_NOT_GUESSED,
  MODAL_BACKWRITE_SHOW_WORD,
  MODAL_BACKWRITE_TITLE,
  MODAL_BACKWRITE_WHO_GUESSED,
  MODAL_BACKWRITE_WORD_TO_WRITE,
} from "../../texts";
import Button from "../ui/button";
import Select from "../ui/select";
import { H3 } from "./h3";

interface BackWriteResultProps {
  isOpen: boolean;
  actionData: BackWrite;
  onResolveBackWrite?: (success: boolean, guessPlayerId?: number) => void;
  onClose: () => void;
  allPlayers: Player[];
}

const BackWriteResult: React.FC<BackWriteResultProps> = ({
  isOpen,
  actionData,
  onResolveBackWrite,
  onClose,
  allPlayers,
}) => {
  const [showBackWriteWord, setShowBackWriteWord] = useState(false);
  const [backWriteGuessed, setBackWriteGuessed] = useState<boolean | null>(
    null,
  );
  const [backWriteGuesserId, setBackWriteGuesserId] = useState<number | null>(
    null,
  );

  // Reset della parte relativa alla scrittura sulla schiena
  useEffect(() => {
    if (isOpen) {
      setShowBackWriteWord(false);
      setBackWriteGuessed(null);
      setBackWriteGuesserId(null);
    }
  }, [isOpen]);

  const handleBackWriteResolution = (success: boolean, guesserId?: number) => {
    setBackWriteGuessed(success);
    setBackWriteGuesserId(guesserId || null);

    // Scrittura sulla schiena indovinata ma giocatore che ha indovinato non ancora selezionato
    if (success && guesserId === undefined) {
      return;
    }

    // Scrittura sulla schiena non indovinata o
    // Scrittura sulla schiena indovinata e giocatore selezionato
    if (onResolveBackWrite) {
      onResolveBackWrite(success, guesserId);
    }
    onClose();
  };

  return (
    <div className="mt-4">
      <H3>{MODAL_BACKWRITE_TITLE}</H3>
      {!showBackWriteWord && (
        <Button
          onClick={() => setShowBackWriteWord(true)}
          color="purple"
          className="mx-auto"
        >
          {MODAL_BACKWRITE_SHOW_WORD}
        </Button>
      )}
      {showBackWriteWord && (
        <>
          <p className="mb-1 text-xl">
            {MODAL_BACKWRITE_WORD_TO_WRITE}{" "}
            <span className="font-bold">{actionData.cardTopic.cardTitle}</span>
          </p>
          <Button
            onClick={() => setShowBackWriteWord(false)}
            color="purple"
            className="mx-auto"
          >
            {MODAL_BACKWRITE_HIDE_WORD}
          </Button>
          <div className="mt-2 flex justify-center space-x-4">
            <Button
              onClick={() =>
                handleBackWriteResolution(
                  true,
                  backWriteGuesserId !== null ? backWriteGuesserId : undefined,
                )
              }
              color="green"
            >
              {MODAL_BACKWRITE_GUESSED}
            </Button>
            <Button
              onClick={() => handleBackWriteResolution(false)}
              color="red"
            >
              {MODAL_BACKWRITE_NOT_GUESSED}
            </Button>
          </div>
        </>
      )}
      {backWriteGuessed !== null && backWriteGuessed && (
        <div className="mt-2">
          <H3>{MODAL_BACKWRITE_WHO_GUESSED}</H3>
          <Select
            value={
              backWriteGuesserId !== null ? backWriteGuesserId.toString() : ""
            }
            onChange={(e) => setBackWriteGuesserId(Number(e.target.value))}
            options={allPlayers
              .filter((player) => {
                // Trova il backWritePlayer corrente in allPlayers per evitare problemi di riferimento
                const currentBackWritePlayer = allPlayers.find(
                  (p) => p.getId() === actionData.backWritePlayer.getId(),
                );
                return currentBackWritePlayer
                  ? player.getId() !== currentBackWritePlayer.getId()
                  : true;
              })
              .map((player) => ({
                value: player.getId(),
                label: player.getName(),
              }))}
            className="m-2"
            placeholder={LABEL_SELECT_PLAYER}
          />
          <Button
            onClick={() =>
              handleBackWriteResolution(
                true,
                backWriteGuesserId !== null ? backWriteGuesserId : undefined,
              )
            }
            color="blue"
            className="mx-auto"
            disabled={backWriteGuesserId === null}
          >
            {MODAL_BACKWRITE_CONFIRM}
          </Button>
        </div>
      )}
    </div>
  );
};

export default BackWriteResult;
