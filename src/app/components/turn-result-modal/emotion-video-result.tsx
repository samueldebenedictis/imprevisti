import type React from "react";
import { useState } from "react";
import type { EmotionVideo } from "@/model/deck";
import {
  MODAL_EMOTION_VIDEO_ANSWER,
  MODAL_EMOTION_VIDEO_CORRECT,
  MODAL_EMOTION_VIDEO_SHOW_ANSWER,
  MODAL_EMOTION_VIDEO_TITLE,
  MODAL_EMOTION_VIDEO_WRONG,
} from "../../texts";
import EmotionVideoPlayer from "../emotion-video-player";
import Button from "../ui/button";
import { H3 } from "./h3";

interface EmotionVideoResultProps {
  actionData: EmotionVideo;
  onResolveEmotionVideo?: (success: boolean) => void;
  onClose: () => void;
}

const EmotionVideoResult: React.FC<EmotionVideoResultProps> = ({
  actionData,
  onResolveEmotionVideo,
  onClose,
}) => {
  const [showEmotionAnswer, setShowEmotionAnswer] = useState(false);

  const handleEmotionVideoResolution = (success: boolean) => {
    if (onResolveEmotionVideo) {
      onResolveEmotionVideo(success);
    }
    setShowEmotionAnswer(false);
    onClose();
  };

  return (
    <div className="mt-4">
      <H3>{MODAL_EMOTION_VIDEO_TITLE}</H3>
      <div className="mb-4 flex justify-center">
        <EmotionVideoPlayer videoUrl={actionData.videoUrl} />
      </div>
      {!showEmotionAnswer && (
        <Button
          onClick={() => setShowEmotionAnswer(true)}
          color="purple"
          className="mx-auto"
        >
          {MODAL_EMOTION_VIDEO_SHOW_ANSWER}
        </Button>
      )}
      {showEmotionAnswer && (
        <>
          <p className="mb-1 text-xl">
            {MODAL_EMOTION_VIDEO_ANSWER}{" "}
            <span className="font-bold">
              {actionData.cardEmotion.cardTitle}
            </span>
          </p>
          <div className="flex justify-center space-x-4">
            <Button
              onClick={() => handleEmotionVideoResolution(true)}
              color="green"
            >
              {MODAL_EMOTION_VIDEO_CORRECT}
            </Button>
            <Button
              onClick={() => handleEmotionVideoResolution(false)}
              color="red"
            >
              {MODAL_EMOTION_VIDEO_WRONG}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default EmotionVideoResult;
