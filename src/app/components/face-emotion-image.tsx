import Image from "next/image";
import type React from "react";
import { imagePrefix } from "../image-prefix";

interface FaceEmotionImageProps {
  imageUrl: string;
  alt: string;
  className?: string;
  onError?: React.ReactEventHandler<HTMLImageElement>;
}

/**
 * Foto del volto della sfida "Indovina l'emozione".
 */
const FaceEmotionImage: React.FC<FaceEmotionImageProps> = ({
  imageUrl,
  alt,
  className,
  onError,
}) => (
  <Image
    width={200}
    height={200}
    src={`${imagePrefix}${imageUrl}`}
    alt={alt}
    className={className}
    onError={onError}
  />
);

export default FaceEmotionImage;
