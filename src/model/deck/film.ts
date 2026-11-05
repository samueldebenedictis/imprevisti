import type { Player } from "../player";
import type { Card } from "./card";

/**
 * Represents a film scene action in the game.
 * It holds the player who has to guess the emotion and the card with the scene video.
 */
export class Film {
  /**
   * Creates a new instance of Film.
   * @param emotionPlayer - The player who has to guess the emotion shown in the scene.
   * @param cardEmotion - The card containing the correct emotion.
   * @param videoUrl - The URL of the film scene video.
   */
  constructor(
    public emotionPlayer: Player,
    public cardEmotion: Card,
    public videoUrl: string,
  ) {}
}

/**
 * Video segnaposto usato finché le scene originali non vengono reinserite
 * (mancano i diritti sui film, vedi FILM_ENABLED in src/vars.ts).
 */
const FILM_PLACEHOLDER_URL = "/videos/film-placeholder.mp4";

/** Scene di film: una per ciascuna emozione (video in public/videos). */
export const filmCards = [
  {
    title: "scena-felicita",
    videoUrl: FILM_PLACEHOLDER_URL,
    emotion: "felicità",
  },
  { title: "scena-rabbia", videoUrl: FILM_PLACEHOLDER_URL, emotion: "rabbia" },
  {
    title: "scena-tristezza",
    videoUrl: FILM_PLACEHOLDER_URL,
    emotion: "tristezza",
  },
  {
    title: "scena-disgusto",
    videoUrl: FILM_PLACEHOLDER_URL,
    emotion: "disgusto",
  },
  { title: "scena-paura", videoUrl: FILM_PLACEHOLDER_URL, emotion: "paura" },
];
