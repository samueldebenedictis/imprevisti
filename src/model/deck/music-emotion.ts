import type { Player } from "../player";
import type { Card } from "./card";

export class MusicEmotion {
  /**
   * Crea una nuova istanza di MusicEmotion.
   * @param musicEmotionPlayer - Il giocatore che deve esprimere l'emozione con una canzone.
   * @param cardEmotion - L'emozione da esprimere (simulata da una carta).
   */
  constructor(
    public musicEmotionPlayer: Player,
    public cardEmotion: Card,
  ) {}
}

export const musicEmotionWords = [
  "Felice",
  "Triste",
  "Arrabbiato",
  "Sorpresa",
  "Paura",
  "Disgusto",
  "Amore",
  "Odio",
  "Gioia",
  "Dolore",
  "Calma",
  "Ansia",
  "Speranza",
  "Delusione",
  "Entusiasmo",
  "Noia",
  "Orgoglio",
  "Vergogna",
  "Geloso",
  "Grato",
];

export const musicEmotionCards = musicEmotionWords.map((word) => word);
