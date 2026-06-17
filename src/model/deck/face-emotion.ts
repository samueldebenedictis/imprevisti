import type { Player } from "../player";
import type { Card } from "./card";

/**
 * Represents a face emotion action in the game.
 * It holds the player who has to guess the emotion and the card with the emotion image.
 */
export class FaceEmotion {
  /**
   * Creates a new instance of FaceEmotion.
   * @param emotionPlayer - The player who has to guess the emotion.
   * @param cardEmotion - The card containing the emotion image and correct answer.
   * @param imageUrl - The URL of the emotion image.
   */
  constructor(
    public emotionPlayer: Player,
    public cardEmotion: Card,
    public imageUrl: string,
  ) {}
}

export const faceEmotionCards = [
  {
    title: "uomo-1-felice",
    imageUrl: "/images/face-emotion/uomo-1-felice.png",
    emotion: "felicità",
  },
  {
    title: "uomo-1-arrabbiato",
    imageUrl: "/images/face-emotion/uomo-1-arrabbiato.png",
    emotion: "rabbia",
  },
  {
    title: "uomo-1-triste",
    imageUrl: "/images/face-emotion/uomo-1-triste.png",
    emotion: "tristezza",
  },
  {
    title: "uomo-1-sorpreso",
    imageUrl: "/images/face-emotion/uomo-1-sorpreso.png",
    emotion: "sorpresa",
  },
  {
    title: "uomo-1-spaventato",
    imageUrl: "/images/face-emotion/uomo-1-spaventato.png",
    emotion: "paura",
  },
  {
    title: "uomo-1-stanco",
    imageUrl: "/images/face-emotion/uomo-1-stanco.png",
    emotion: "stanchezza",
  },
  {
    title: "bambina-felice",
    imageUrl: "/images/face-emotion/bambina-felice.png",
    emotion: "felicità",
  },
  {
    title: "bambina-arrabbiato",
    imageUrl: "/images/face-emotion/bambina-arrabbiato.png",
    emotion: "rabbia",
  },
  {
    title: "bambina-triste",
    imageUrl: "/images/face-emotion/bambina-triste.png",
    emotion: "tristezza",
  },
  {
    title: "bambina-sorpreso",
    imageUrl: "/images/face-emotion/bambina-sorpreso.png",
    emotion: "sorpresa",
  },
  {
    title: "bambina-spaventato",
    imageUrl: "/images/face-emotion/bambina-spaventato.png",
    emotion: "paura",
  },
  {
    title: "bambina-stanco",
    imageUrl: "/images/face-emotion/bambina-stanco.png",
    emotion: "stanchezza",
  },
  {
    title: "anziano-felice",
    imageUrl: "/images/face-emotion/anziano-felice.png",
    emotion: "felicità",
  },
  {
    title: "anziano-arrabbiato",
    imageUrl: "/images/face-emotion/anziano-arrabbiato.png",
    emotion: "rabbia",
  },
  {
    title: "anziano-triste",
    imageUrl: "/images/face-emotion/anziano-triste.png",
    emotion: "tristezza",
  },
  {
    title: "anziano-sorpreso",
    imageUrl: "/images/face-emotion/anziano-sorpreso.png",
    emotion: "sorpresa",
  },
  {
    title: "anziano-spaventato",
    imageUrl: "/images/face-emotion/anziano-spaventato.png",
    emotion: "paura",
  },
  {
    title: "anziano-stanco",
    imageUrl: "/images/face-emotion/anziano-stanco.png",
    emotion: "stanchezza",
  },
  {
    title: "bambino-felice",
    imageUrl: "/images/face-emotion/bambino-felice.png",
    emotion: "felicità",
  },
  {
    title: "bambino-arrabbiato",
    imageUrl: "/images/face-emotion/bambino-arrabbiato.png",
    emotion: "rabbia",
  },
  {
    title: "bambino-triste",
    imageUrl: "/images/face-emotion/bambino-triste.png",
    emotion: "tristezza",
  },
  {
    title: "bambino-sorpreso",
    imageUrl: "/images/face-emotion/bambino-sorpreso.png",
    emotion: "sorpresa",
  },
  {
    title: "bambino-spaventato",
    imageUrl: "/images/face-emotion/bambino-spaventato.png",
    emotion: "paura",
  },
  {
    title: "bambino-stanco",
    imageUrl: "/images/face-emotion/bambino-stanco.png",
    emotion: "stanchezza",
  },
  {
    title: "donna-felice",
    imageUrl: "/images/face-emotion/donna-felice.png",
    emotion: "felicità",
  },
  {
    title: "donna-arrabbiato",
    imageUrl: "/images/face-emotion/donna-arrabbiato.png",
    emotion: "rabbia",
  },
  {
    title: "donna-triste",
    imageUrl: "/images/face-emotion/donna-triste.png",
    emotion: "tristezza",
  },
  {
    title: "donna-sorpreso",
    imageUrl: "/images/face-emotion/donna-sorpreso.png",
    emotion: "sorpresa",
  },
  {
    title: "donna-spaventato",
    imageUrl: "/images/face-emotion/donna-spaventato.png",
    emotion: "paura",
  },
  {
    title: "donna-stanco",
    imageUrl: "/images/face-emotion/donna-stanco.png",
    emotion: "stanchezza",
  },
  {
    title: "uomo-2-felice",
    imageUrl: "/images/face-emotion/uomo-2-felice.png",
    emotion: "felicità",
  },
  {
    title: "uomo-2-arrabbiato",
    imageUrl: "/images/face-emotion/uomo-2-arrabbiato.png",
    emotion: "rabbia",
  },
  {
    title: "uomo-2-triste",
    imageUrl: "/images/face-emotion/uomo-2-triste.png",
    emotion: "tristezza",
  },
  {
    title: "uomo-2-sorpreso",
    imageUrl: "/images/face-emotion/uomo-2-sorpreso.png",
    emotion: "sorpresa",
  },
  {
    title: "uomo-2-spaventato",
    imageUrl: "/images/face-emotion/uomo-2-spaventato.png",
    emotion: "paura",
  },
  {
    title: "uomo-2-stanco",
    imageUrl: "/images/face-emotion/uomo-2-stanco.png",
    emotion: "stanchezza",
  },
];
