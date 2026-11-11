import type React from "react";
import { useEffect, useState } from "react";
import { isFacesImageUrl } from "@/lib/faces";
import { acceptFacesAccess, fetchFacesAccess } from "@/lib/faces-client";
import { imagePrefix } from "../image-prefix";
import {
  FACES_DISCLAIMER_DECLINED,
  FACES_DISCLAIMER_SHOW_AGAIN,
  FACES_DISCLAIMER_TITLE,
} from "../texts";
import FacesDisclaimer from "./faces-disclaimer";
import Button from "./ui/button";

interface FaceEmotionImageProps {
  imageUrl: string;
  alt: string;
  className?: string;
  onError?: React.ReactEventHandler<HTMLImageElement>;
}

type AccessState = "checking" | "required" | "granted" | "declined" | "error";

/**
 * Foto del volto della sfida "Indovina l'emozione".
 *
 * Le fotografie FACES (URL /api/faces/...) si vedono solo dopo aver accettato
 * il disclaimer su questo dispositivo, come richiede il punto 4 del FACES
 * Platform Release Agreement. Le altre immagini (segnaposto, Storybook) sono
 * mostrate direttamente.
 */
const FaceEmotionImage: React.FC<FaceEmotionImageProps> = ({
  imageUrl,
  alt,
  className,
  onError,
}) => {
  const gated = isFacesImageUrl(imageUrl);
  const [access, setAccess] = useState<AccessState>(
    gated ? "checking" : "granted",
  );

  useEffect(() => {
    if (!gated) return;
    let cancelled = false;
    fetchFacesAccess().then((granted) => {
      if (!cancelled) setAccess(granted ? "granted" : "required");
    });
    return () => {
      cancelled = true;
    };
  }, [gated]);

  const accept = async () => {
    setAccess((await acceptFacesAccess()) ? "granted" : "error");
  };

  if (access === "checking") return null;

  if (access === "granted")
    return (
      // biome-ignore lint/performance/noImgElement: next/image passerebbe dall'ottimizzatore, che non ha il cookie d'accesso e terrebbe una copia in cache
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
    );

  if (access === "declined")
    return (
      <div className="ui-border-dark mx-auto max-w-sm bg-gray-100 p-4 text-center">
        <p className="ui-text-normal">{FACES_DISCLAIMER_DECLINED}</p>
        <Button
          onClick={() => setAccess("required")}
          color="black"
          className="mx-auto"
        >
          {FACES_DISCLAIMER_SHOW_AGAIN}
        </Button>
      </div>
    );

  return (
    <FacesDisclaimer
      title={FACES_DISCLAIMER_TITLE}
      error={access === "error"}
      onAccept={accept}
      onDecline={() => setAccess("declined")}
    />
  );
};

export default FaceEmotionImage;
