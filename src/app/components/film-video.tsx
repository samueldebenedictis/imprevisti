import { imagePrefix } from "../image-prefix";

interface FilmVideoProps {
  videoUrl: string;
  title: string;
}

/**
 * Scena di film da guardare: con audio, avviata dall'utente con i controlli.
 * key su src: cambiando scena il player riparte da zero.
 */
export default function FilmVideo({ videoUrl, title }: FilmVideoProps) {
  return (
    // biome-ignore lint/a11y/useMediaCaption: sottotitoli non disponibili per le scene
    <video
      key={videoUrl}
      controls
      playsInline
      preload="metadata"
      aria-label={title}
      className="ui-border-dark mx-auto max-h-64 w-full max-w-md"
      src={`${imagePrefix}${videoUrl}`}
    />
  );
}
