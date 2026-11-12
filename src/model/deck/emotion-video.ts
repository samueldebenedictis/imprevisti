import type { Player } from "../player";
import type { SquareJSON } from "../square/square";
import type { Card } from "./card";
import {
  type FaceSet,
  faceEmotionSubjects,
  facesImageUrl,
  playableFaceEmotionLabels,
} from "./face-emotion";

/**
 * Sfida "Emozioni in movimento": il giocatore guarda una clip in cui un volto
 * passa da un'espressione neutra a un'emozione, e deve indovinarla.
 */
export class EmotionVideo {
  /**
   * @param emotionPlayer - Il giocatore che deve indovinare l'emozione
   * @param cardEmotion - La carta con l'emozione corretta
   * @param videoUrl - L'URL della clip
   */
  constructor(
    public emotionPlayer: Player,
    public cardEmotion: Card,
    public videoUrl: string,
  ) {}
}

/**
 * Clip del database Dynamic FACES (Holland, Ebner, Lin & Samanez-Larkin,
 * 2019), degli stessi soggetti delle fotografie FACES. Come le foto non sono
 * nel repository: le serve /api/faces/[file], solo con il codice
 * dell'educatore e il disclaimer accettato. Usate così come sono, senza
 * modifiche (punto 5 del FACES Platform Release Agreement).
 * File: {id}_{eta}_{genere}_n_{emozione}.mp4 (da neutro all'emozione, 2 s).
 */
const buildEmotionVideoCards = (toVideoUrl: (file: string) => string) =>
  faceEmotionSubjects.flatMap((subject) =>
    playableFaceEmotionLabels.map(({ code, emotion }) => {
      const file = `${subject.id}_${subject.code}_n_${code}.mp4`;
      return {
        title: `${subject.title}-${emotion}-video`,
        /** Nome del file Dynamic FACES nell'archivio privato. */
        file,
        videoUrl: toVideoUrl(file),
        emotion,
      };
    }),
  );

export const emotionVideoCards = buildEmotionVideoCards(facesImageUrl);

/** Nomi delle clip che il Route Handler può restituire. */
export const emotionVideoFiles: ReadonlySet<string> = new Set(
  emotionVideoCards.map((card) => card.file),
);

/** Clip senza volti per Storybook e per i test. */
export const EMOTION_VIDEO_PLACEHOLDER_URL =
  "/videos/emotion-video-placeholder.mp4";

/** Stesse carte con la clip segnaposto, per Storybook. */
export const emotionVideoStorybookCards = buildEmotionVideoCards(
  () => EMOTION_VIDEO_PLACEHOLDER_URL,
);

/**
 * Caselle del tabellone per il set di volti della partita. Le clip esistono
 * solo per le fotografie FACES: senza codice ("ai") le caselle "Emozioni in
 * movimento" diventano "Indovina l'emozione" con i volti illustrati, così il
 * tabellone mantiene lo stesso numero di sfide.
 */
export function squaresForFaceSet(
  squares: SquareJSON[],
  faceSet: FaceSet,
): SquareJSON[] {
  if (faceSet === "faces") return squares;
  return squares.map((square) =>
    square.type === "emotion-video"
      ? { number: square.number, type: "face-emotion" }
      : square,
  );
}
