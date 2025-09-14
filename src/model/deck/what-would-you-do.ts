import type { Player } from "../player";
import type { Card } from "./card";

export class WhatWouldYouDo {
  /**
   * Crea una nuova istanza di WhatWouldYouDo.
   * @param whatWouldYouDoPlayer - Il giocatore che deve rispondere alla domanda.
   * @param cardQuestion - La domanda da rispondere (simulata da una carta).
   */
  constructor(
    public whatWouldYouDoPlayer: Player,
    public cardQuestion: Card,
  ) {}
}

export const whatWouldYouDoWords = [
  "Cosa faresti se vincessi 1 milione di euro?",
  "Cosa faresti se potessi volare?",
  "Cosa faresti se incontrassi un alieno?",
  "Cosa faresti se perdessi il lavoro?",
  "Cosa faresti se vincessi la lotteria?",
  "Cosa faresti se potessi parlare con gli animali?",
  "Cosa faresti se diventassi invisibile?",
  "Cosa faresti se potessi viaggiare nel tempo?",
  "Cosa faresti se incontrassi il tuo idolo?",
  "Cosa faresti se perdessi il telefono?",
  "Cosa faresti se potessi cambiare una legge?",
  "Cosa faresti se vincessi un viaggio intorno al mondo?",
  "Cosa faresti se potessi avere qualsiasi superpotere?",
  "Cosa faresti se incontrassi un fantasma?",
  "Cosa faresti se perdessi tutti i tuoi amici?",
  "Cosa faresti se potessi vivere per sempre?",
  "Cosa faresti se vincessi un Oscar?",
  "Cosa faresti se potessi leggere nel pensiero?",
  "Cosa faresti se incontrassi un dinosauro?",
  "Cosa faresti se perdessi la memoria?",
];

export const whatWouldYouDoCards = whatWouldYouDoWords.map((word) => word);
