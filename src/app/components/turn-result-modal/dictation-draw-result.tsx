import Image from "next/image";
import type React from "react";
import { useEffect, useState } from "react";
import type { DictationDraw } from "@/model/deck";
import type { Player } from "@/model/player";
import {
  LABEL_SELECT_PLAYER,
  MODAL_DICTATION_DRAW_CONFIRM,
  MODAL_DICTATION_DRAW_DRAWN,
  MODAL_DICTATION_DRAW_HIDE_IMAGE,
  MODAL_DICTATION_DRAW_NOT_DRAWN,
  MODAL_DICTATION_DRAW_SHOW_IMAGE,
  MODAL_DICTATION_DRAW_TITLE,
  MODAL_DICTATION_DRAW_TOPIC,
  MODAL_DICTATION_DRAW_WHO_DREW,
} from "../../texts";
import Button from "../ui/button";
import Select from "../ui/select";
import { H3 } from "./h3";

interface DictationDrawResultProps {
  isOpen: boolean;
  actionData: DictationDraw;
  onResolveDictationDraw?: (success: boolean, drawingPlayerId?: number) => void;
  onClose: () => void;
  allPlayers: Player[];
}

const DictationDrawResult: React.FC<DictationDrawResultProps> = ({
  isOpen,
  actionData,
  onResolveDictationDraw,
  onClose,
  allPlayers,
}) => {
  const [showImageTopic, setShowImageTopic] = useState(false);
  const [imageDrawn, setImageDrawn] = useState<boolean | null>(null);
  const [drawingPlayerId, setDrawingPlayerId] = useState<number | null>(null);

  // Reset the dictation draw related state
  useEffect(() => {
    if (isOpen) {
      setShowImageTopic(false);
      setImageDrawn(null);
      setDrawingPlayerId(null);
    }
  }, [isOpen]);

  const handleDictationDrawResolution = (
    success: boolean,
    drawerId?: number,
  ) => {
    setImageDrawn(success);
    setDrawingPlayerId(drawerId || null);

    // Image drawn but player who drew it not yet selected
    if (success && drawerId === undefined) {
      return;
    }

    // Image not drawn or
    // Image drawn and player selected
    if (onResolveDictationDraw) {
      onResolveDictationDraw(success, drawerId);
    }
    onClose();
  };

  return (
    <div className="mt-4">
      <H3>{MODAL_DICTATION_DRAW_TITLE}</H3>
      {!showImageTopic && (
        <Button
          onClick={() => setShowImageTopic(true)}
          color="purple"
          className="mx-auto"
        >
          {MODAL_DICTATION_DRAW_SHOW_IMAGE}
        </Button>
      )}
      {showImageTopic && (
        <>
          <div className="mb-4 flex flex-col items-center">
            <p className="mb-2 text-xl">{MODAL_DICTATION_DRAW_TOPIC}</p>
            {actionData.imageUrl && (
              <Image
                width={200}
                height={200}
                src={actionData.imageUrl}
                alt={actionData.cardTopic.cardTitle}
                className="ui-border-dark m-4 max-h-64 max-w-full"
                onError={(e) => {
                  // Fallback to text if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  const fallbackText =
                    target.parentElement?.querySelector(".fallback-text");
                  if (fallbackText) {
                    (fallbackText as HTMLElement).style.display = "block";
                  }
                }}
              />
            )}
            <p
              className="fallback-text text-center text-lg"
              style={{ display: actionData.imageUrl ? "none" : "block" }}
            >
              <span className="font-bold">
                {actionData.cardTopic.cardTitle}
              </span>
            </p>
          </div>
          <Button
            onClick={() => setShowImageTopic(false)}
            color="purple"
            className="mx-auto"
          >
            {MODAL_DICTATION_DRAW_HIDE_IMAGE}
          </Button>
          <div className="mt-2 flex justify-center space-x-4">
            <Button
              onClick={() =>
                handleDictationDrawResolution(
                  true,
                  drawingPlayerId !== null ? drawingPlayerId : undefined,
                )
              }
              color="green"
            >
              {MODAL_DICTATION_DRAW_DRAWN}
            </Button>
            <Button
              onClick={() => handleDictationDrawResolution(false)}
              color="red"
            >
              {MODAL_DICTATION_DRAW_NOT_DRAWN}
            </Button>
          </div>
        </>
      )}
      {imageDrawn !== null && imageDrawn && (
        <div className="mt-2">
          <H3>{MODAL_DICTATION_DRAW_WHO_DREW}</H3>
          <Select
            value={drawingPlayerId !== null ? drawingPlayerId.toString() : ""}
            onChange={(e) => setDrawingPlayerId(Number(e.target.value))}
            options={allPlayers
              .filter((player) => {
                // Find the drawingPlayer in allPlayers to avoid reference issues
                const currentDrawingPlayer = allPlayers.find(
                  (p) => p.getId() === actionData.drawingPlayer.getId(),
                );
                return currentDrawingPlayer
                  ? player.getId() !== currentDrawingPlayer.getId()
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
              handleDictationDrawResolution(
                true,
                drawingPlayerId !== null ? drawingPlayerId : undefined,
              )
            }
            color="blue"
            className="mx-auto"
            disabled={drawingPlayerId === null}
          >
            {MODAL_DICTATION_DRAW_CONFIRM}
          </Button>
        </div>
      )}
    </div>
  );
};

export default DictationDrawResult;
