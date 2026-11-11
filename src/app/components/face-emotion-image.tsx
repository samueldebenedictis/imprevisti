import type React from "react";
import { useEffect, useState } from "react";
import {
  FACES_ACCESS_API,
  FACES_DISCLAIMER_EN,
  FACES_DISCLAIMER_IT,
  isFacesImageUrl,
} from "@/lib/faces";
import { imagePrefix } from "../image-prefix";
import {
  FACES_DISCLAIMER_ACCEPT,
  FACES_DISCLAIMER_DECLINE,
  FACES_DISCLAIMER_DECLINED,
  FACES_DISCLAIMER_ERROR,
  FACES_DISCLAIMER_SHOW_AGAIN,
  FACES_DISCLAIMER_TITLE,
} from "../texts";
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
    fetch(FACES_ACCESS_API, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : { granted: false }))
      .then((data: { granted?: boolean }) => {
        if (!cancelled) setAccess(data.granted ? "granted" : "required");
      })
      .catch(() => {
        if (!cancelled) setAccess("required");
      });
    return () => {
      cancelled = true;
    };
  }, [gated]);

  const accept = async () => {
    try {
      const res = await fetch(FACES_ACCESS_API, { method: "POST" });
      setAccess(res.ok ? "granted" : "error");
    } catch {
      setAccess("error");
    }
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
    <div className="ui-border-dark mx-auto max-w-sm bg-gray-100 p-4 text-center">
      <p className="ui-text-subtitle mb-2">{FACES_DISCLAIMER_TITLE}</p>
      <p className="ui-text-normal mb-2">{FACES_DISCLAIMER_IT}</p>
      <p className="text-gray-600 text-sm italic" lang="en">
        {FACES_DISCLAIMER_EN}
      </p>
      {access === "error" && (
        <p className="ui-text-normal mt-2 text-red-600">
          {FACES_DISCLAIMER_ERROR}
        </p>
      )}
      <div className="flex justify-center">
        <Button onClick={accept} color="green">
          {FACES_DISCLAIMER_ACCEPT}
        </Button>
        <Button onClick={() => setAccess("declined")} color="red">
          {FACES_DISCLAIMER_DECLINE}
        </Button>
      </div>
    </div>
  );
};

export default FaceEmotionImage;
