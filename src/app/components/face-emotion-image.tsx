import type React from "react";
import { imagePrefix } from "../image-prefix";
import FacesAccessGate from "./faces-access-gate";

interface FaceEmotionImageProps {
  imageUrl: string;
  alt: string;
  className?: string;
  onError?: React.ReactEventHandler<HTMLImageElement>;
  /** Partita multigiocatore: serve per l'accesso alle fotografie FACES. */
  sessionId?: string;
}

/**
 * Foto del volto della sfida "Indovina l'emozione". Le fotografie FACES
 * passano da FacesAccessGate (codice dell'educatore e disclaimer).
 */
const FaceEmotionImage: React.FC<FaceEmotionImageProps> = ({
  imageUrl,
  alt,
  className,
  onError,
  sessionId,
}) => (
  <FacesAccessGate url={imageUrl} sessionId={sessionId}>
    {/* biome-ignore lint/performance/noImgElement: next/image passerebbe dall'ottimizzatore, che non ha il cookie d'accesso e terrebbe una copia in cache */}
    <img
      width={200}
      height={200}
      src={`${imagePrefix}${imageUrl}`}
      alt={alt}
      className={`select-none ${className ?? ""}`}
      style={{ WebkitTouchCallout: "none" }}
      draggable={false}
      onContextMenu={(e) => e.preventDefault()}
      onError={onError}
    />
  </FacesAccessGate>
);

export default FaceEmotionImage;
