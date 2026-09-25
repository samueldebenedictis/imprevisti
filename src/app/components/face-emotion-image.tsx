import Image from "next/image";
import type React from "react";
import { useState } from "react";
import { getFaceEmotionGifUrl } from "@/model/deck";
import { useFaceEmotionStore } from "@/store/face-emotion-store";
import { imagePrefix } from "../image-prefix";
import {
  LABEL_FACE_EMOTION_ANIMATED,
  LABEL_FACE_EMOTION_STATIC,
} from "../texts";
import { LabelCheckbox } from "./ui/label";

interface FaceEmotionImageProps {
  imageUrl: string;
  alt: string;
  className?: string;
  onError?: React.ReactEventHandler<HTMLImageElement>;
}

/**
 * Foto del volto con checkbox "Animato"/"Non animato": se attivo mostra la gif
 * di morphing neutro -> espressione, ripiegando sulla foto statica se manca.
 */
const FaceEmotionImage: React.FC<FaceEmotionImageProps> = ({
  imageUrl,
  alt,
  className,
  onError,
}) => {
  const { isAnimated, toggleAnimated } = useFaceEmotionStore();
  const [failedGifUrl, setFailedGifUrl] = useState<string | null>(null);

  const gifUrl = getFaceEmotionGifUrl(imageUrl);
  const useGif = isAnimated && failedGifUrl !== gifUrl;

  return (
    <>
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
      <Image
        width={200}
        height={200}
        src={`${imagePrefix}${useGif ? gifUrl : imageUrl}`}
        alt={alt}
        className={className}
        onError={(e) => {
          if (useGif) {
            setFailedGifUrl(gifUrl);
            return;
          }
          onError?.(e);
        }}
      />
    </>
  );
};

export default FaceEmotionImage;
