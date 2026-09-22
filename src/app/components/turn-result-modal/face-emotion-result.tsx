import Image from "next/image";
import type React from "react";
import { useState } from "react";
import { type FaceEmotion, getFaceEmotionGifUrl } from "@/model/deck";
import { useFaceEmotionStore } from "@/store/face-emotion-store";
import { imagePrefix } from "../../image-prefix";
import {
  LABEL_FACE_EMOTION_ANIMATED,
  LABEL_FACE_EMOTION_STATIC,
  MODAL_FACE_EMOTION_ANSWER,
  MODAL_FACE_EMOTION_CORRECT,
  MODAL_FACE_EMOTION_SHOW_ANSWER,
  MODAL_FACE_EMOTION_TITLE,
  MODAL_FACE_EMOTION_WRONG,
} from "../../texts";
import Button from "../ui/button";
import { LabelCheckbox } from "../ui/label";
import { H3 } from "./h3";

interface FaceEmotionResultProps {
  actionData: FaceEmotion;
  onResolveFaceEmotion?: (success: boolean) => void;
  onClose: () => void;
}

const FaceEmotionResult: React.FC<FaceEmotionResultProps> = ({
  actionData,
  onResolveFaceEmotion,
  onClose,
}) => {
  const [showEmotionAnswer, setShowEmotionAnswer] = useState(false);
  const { isAnimated, toggleAnimated } = useFaceEmotionStore();

  const imageSrc = isAnimated
    ? getFaceEmotionGifUrl(actionData.imageUrl)
    : actionData.imageUrl;

  const handleShowEmotionAnswer = () => {
    setShowEmotionAnswer(true);
  };

  const handleEmotionResolution = (success: boolean) => {
    if (onResolveFaceEmotion) {
      onResolveFaceEmotion(success);
    }
    setShowEmotionAnswer(false);
    onClose();
  };

  return (
    <div className="mt-4">
      <H3>{MODAL_FACE_EMOTION_TITLE}</H3>
      <div className="mb-2 flex items-center justify-center space-x-3">
        <input
          type="checkbox"
          id="face-emotion-animated-toggle"
          name="face-emotion-animated-toggle"
          checked={isAnimated}
          onChange={toggleAnimated}
          className="ui-custom-checkbox mr-2"
        />
        <LabelCheckbox htmlFor="face-emotion-animated-toggle">
          {isAnimated ? LABEL_FACE_EMOTION_ANIMATED : LABEL_FACE_EMOTION_STATIC}
        </LabelCheckbox>
      </div>
      <div className="mb-4 flex justify-center">
        <Image
          width={200}
          height={200}
          src={`${imagePrefix}${imageSrc}`}
          alt={actionData.cardEmotion.cardTitle}
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
        <p
          className="fallback-text text-center text-lg"
          style={{ display: "none" }}
        >
          <span className="font-bold">{actionData.cardEmotion.cardTitle}</span>
        </p>
      </div>
      {!showEmotionAnswer && (
        <Button
          onClick={handleShowEmotionAnswer}
          color="purple"
          className="mx-auto"
        >
          {MODAL_FACE_EMOTION_SHOW_ANSWER}
        </Button>
      )}
      {showEmotionAnswer && (
        <>
          <p className="mb-1 text-xl">
            {MODAL_FACE_EMOTION_ANSWER}{" "}
            <span className="font-bold">
              {actionData.cardEmotion.cardTitle}
            </span>
          </p>
          <div className="flex justify-center space-x-4">
            <Button onClick={() => handleEmotionResolution(true)} color="green">
              {MODAL_FACE_EMOTION_CORRECT}
            </Button>
            <Button onClick={() => handleEmotionResolution(false)} color="red">
              {MODAL_FACE_EMOTION_WRONG}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default FaceEmotionResult;
