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

/** Scene di film: una per ciascuna emozione (video in public/videos). */
export const filmCards = [
  {
    title: "scena-felicita",
    videoUrl: "/videos/felicita.mp4",
    emotion: "felicità",
  },
  { title: "scena-rabbia", videoUrl: "/videos/rabbia.mp4", emotion: "rabbia" },
  {
    title: "scena-tristezza",
    videoUrl: "/videos/tristezza.mp4",
    emotion: "tristezza",
  },
  {
    title: "scena-disgusto",
    videoUrl: "/videos/disgusto.mp4",
    emotion: "disgusto",
  },
  { title: "scena-paura", videoUrl: "/videos/paura.mp4", emotion: "paura" },
];
