import type React from "react";
import { useEffect, useState } from "react";
import type { Mime } from "@/model/deck";
import type { Player } from "@/model/player";
import {
  LABEL_SELECT_PLAYER,
  MODAL_MIME_CONFIRM,
  MODAL_MIME_GUESSED,
  MODAL_MIME_HIDE_TOPIC,
  MODAL_MIME_NOT_GUESSED,
  MODAL_MIME_SHOW_TOPIC,
  MODAL_MIME_TITLE,
  MODAL_MIME_TOPIC,
  MODAL_MIME_WHO_GUESSED,
} from "../../texts";
import Button from "../ui/button";
import Select from "../ui/select";
import { H3 } from "./h3";

interface MimeResultProps {
  isOpen: boolean;
  actionData: Mime;
  onResolveMime?: (success: boolean, guessPlayerId?: number) => void;
  onClose: () => void;
  allPlayers: Player[];
}

const MimeResult: React.FC<MimeResultProps> = ({
  isOpen,
  actionData,
  onResolveMime,
  onClose,
  allPlayers,
}) => {
  const [showMimeTopic, setShowMimeTopic] = useState(false);
  const [mimeGuessed, setMimeGuessed] = useState<boolean | null>(null);
  const [mimeGuesserId, setMimeGuesserId] = useState<number | null>(null);

  // Reset della parte relativa al mimo
  useEffect(() => {
    if (isOpen) {
      setShowMimeTopic(false);
      setMimeGuessed(null);
      setMimeGuesserId(null);
    }
  }, [isOpen]);

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

  return (
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
            <span className="font-bold">{actionData.cardTopic.cardTitle}</span>
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
            <Button onClick={() => handleMimeResolution(false)} color="red">
              {MODAL_MIME_NOT_GUESSED}
            </Button>
          </div>
        </>
      )}
      {mimeGuessed !== null && mimeGuessed && (
        <div className="mt-2">
          <H3>{MODAL_MIME_WHO_GUESSED}</H3>
          <Select
            value={mimeGuesserId !== null ? mimeGuesserId.toString() : ""}
            onChange={(e) => setMimeGuesserId(Number(e.target.value))}
            options={allPlayers
              .filter((player) => {
                // Trova il mimePlayer corrente in allPlayers per evitare problemi di riferimento
                const currentMimePlayer = allPlayers.find(
                  (p) => p.getId() === actionData.mimePlayer.getId(),
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
            placeholder={LABEL_SELECT_PLAYER}
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
  );
};

export default MimeResult;
