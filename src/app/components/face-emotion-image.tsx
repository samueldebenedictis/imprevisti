import type React from "react";
import { useEffect, useState } from "react";
import { isFacesImageUrl } from "@/lib/faces";
import { acceptFacesAccess, fetchFacesAccess } from "@/lib/faces-client";
import { imagePrefix } from "../image-prefix";
import {
  FACES_DISCLAIMER_DECLINED,
  FACES_DISCLAIMER_ERROR,
  FACES_DISCLAIMER_SHOW_AGAIN,
  FACES_DISCLAIMER_TITLE,
  FACES_SESSION_NO_ACCESS,
} from "../texts";
import FacesDisclaimer from "./faces-disclaimer";
import Button from "./ui/button";

interface FaceEmotionImageProps {
  imageUrl: string;
  alt: string;
  className?: string;
  onError?: React.ReactEventHandler<HTMLImageElement>;
  /**
   * Partita multigiocatore: il dispositivo ottiene l'accesso accettando il
   * disclaimer, se l'host ha avviato la partita con un codice FACES.
   */
  sessionId?: string;
}

type AccessState =
  | "checking"
  | "required"
  | "granted"
  | "declined"
  | "unavailable"
  | "error";

/**
 * Foto del volto della sfida "Indovina l'emozione".
 *
 * Le fotografie FACES (URL /api/faces/...) si vedono solo in una partita
 * avviata con il codice dell'educatore e dopo aver accettato il disclaimer su
 * questo dispositivo, come richiede il punto 4 del FACES Platform Release
 * Agreement. Le altre immagini (volti illustrati, segnaposto) sono mostrate
 * direttamente.
 */
const FaceEmotionImage: React.FC<FaceEmotionImageProps> = ({
  imageUrl,
  alt,
  className,
  onError,
  sessionId,
}) => {
  const gated = isFacesImageUrl(imageUrl);
  const [access, setAccess] = useState<AccessState>(
    gated ? "checking" : "granted",
  );

  useEffect(() => {
    if (!gated) return;
    let cancelled = false;
    fetchFacesAccess().then((granted) => {
      if (cancelled) return;
      // Su schermo singolo l'accesso si ottiene solo all'avvio, con il codice
      if (granted) setAccess("granted");
      else setAccess(sessionId ? "required" : "unavailable");
    });
    return () => {
      cancelled = true;
    };
  }, [gated, sessionId]);

  const accept = async () => {
    if (!sessionId) return;
    const result = await acceptFacesAccess({ sessionId });
    if (result === "granted") setAccess("granted");
    else setAccess(result === "no-session-access" ? "unavailable" : "error");
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

  if (access === "unavailable")
    return (
      <div className="ui-border-dark mx-auto max-w-sm bg-gray-100 p-4 text-center">
        <p className="ui-text-normal">{FACES_SESSION_NO_ACCESS}</p>
      </div>
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
      error={access === "error" ? FACES_DISCLAIMER_ERROR : undefined}
      onAccept={accept}
      onDecline={() => setAccess("declined")}
    />
  );
};

export default FaceEmotionImage;
