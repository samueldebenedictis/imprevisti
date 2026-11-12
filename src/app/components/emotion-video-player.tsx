import { useEffect, useState } from "react";
import { isFacesImageUrl } from "@/lib/faces";
import { imagePrefix } from "../image-prefix";
import FacesAccessGate from "./faces-access-gate";

interface EmotionVideoPlayerProps {
  videoUrl: string;
  /** Partita multigiocatore: serve per l'accesso alle clip FACES. */
  sessionId?: string;
}

/**
 * Carica la clip. Le clip FACES (circa 100 KB) si scaricano intere con il
 * cookie d'accesso e si riproducono dalla memoria del browser: niente
 * richieste a intervalli (Range), che Safari su iPhone pretende per i video
 * e che il Route Handler non gestisce, e nessuna copia nella cache.
 */
function useVideoSource(videoUrl: string) {
  const gated = isFacesImageUrl(videoUrl);
  const direct = `${imagePrefix}${videoUrl}`;
  const [source, setSource] = useState<string | null>(gated ? null : direct);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!gated) {
      setSource(direct);
      return;
    }
    let objectUrl: string | null = null;
    let cancelled = false;
    setSource(null);
    setFailed(false);
    fetch(direct, { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status));
        return res.blob();
      })
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setSource(objectUrl);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [gated, direct]);

  return { source, failed };
}

function Clip({ videoUrl }: { videoUrl: string }) {
  const { source, failed } = useVideoSource(videoUrl);

  if (failed)
    return <p className="ui-text-normal text-center">Video non disponibile.</p>;
  if (!source) return null;

  return (
    <video
      key={source}
      src={source}
      autoPlay
      loop
      muted
      playsInline
      disablePictureInPicture
      controlsList="nodownload noplaybackrate noremoteplayback"
      aria-label="Volto che cambia espressione"
      className="ui-border-dark mx-auto max-h-64 max-w-full select-none"
      style={{ WebkitTouchCallout: "none" }}
      onContextMenu={(e) => e.preventDefault()}
    />
  );
}

/**
 * Clip della sfida "Emozioni in movimento": un volto che passa da
 * un'espressione neutra a un'emozione. Parte da sola senza audio e si ripete. Le clip FACES passano da FacesAccessGate
 * (codice dell'educatore e disclaimer); niente download né picture-in-picture.
 */
export default function EmotionVideoPlayer({
  videoUrl,
  sessionId,
}: EmotionVideoPlayerProps) {
  return (
    <FacesAccessGate url={videoUrl} sessionId={sessionId}>
      <Clip videoUrl={videoUrl} />
    </FacesAccessGate>
  );
}
