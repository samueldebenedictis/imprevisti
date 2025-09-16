import type React from "react";
import {
  MODAL_MUSIC_EMOTION_EMOTION_TO_EXPRESS,
  MODAL_MUSIC_EMOTION_GUESSED,
  MODAL_MUSIC_EMOTION_NOT_GUESSED,
  MODAL_MUSIC_EMOTION_TITLE,
} from "@/app/texts";
import type { MusicEmotion } from "@/model/deck";
import Button from "../ui/button";
import { H3 } from "./h3";

interface MusicEmotionResultProps {
  actionData: MusicEmotion;
  onResolveMusicEmotion?: (success: boolean) => void;
  onClose: () => void;
}

const MusicEmotionResult: React.FC<MusicEmotionResultProps> = ({
  actionData,
  onResolveMusicEmotion,
  onClose,
}) => {
  return (
    <div className="mt-4">
      <H3>{MODAL_MUSIC_EMOTION_TITLE}</H3>
      <p className="mb-1 text-xl">
        {MODAL_MUSIC_EMOTION_EMOTION_TO_EXPRESS}{" "}
        <span className="font-bold">{actionData.cardEmotion.cardTitle}</span>
      </p>
      <div className="mt-2 flex justify-center space-x-4">
        <Button
          onClick={() => {
            if (onResolveMusicEmotion) {
              onResolveMusicEmotion(true);
            }
            onClose();
          }}
          color="green"
        >
          {MODAL_MUSIC_EMOTION_GUESSED}
        </Button>
        <Button
          onClick={() => {
            if (onResolveMusicEmotion) {
              onResolveMusicEmotion(false);
            }
            onClose();
          }}
          color="red"
        >
          {MODAL_MUSIC_EMOTION_NOT_GUESSED}
        </Button>
      </div>
    </div>
  );
};

export default MusicEmotionResult;
