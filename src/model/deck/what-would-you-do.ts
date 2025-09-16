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
  "al lavoro non riuscissi a fare bene un compito che ti è stato affidato?",
  "un amico si dimenticasse di un appuntamento con te?",
  "vedessi un compagno rubare dallo zaino di un altro compagno?",
  "sul pullman qualcuno lasciasse il portafogli sul sedile di fianco al tuo?",
  "ti innamorassi di una compagna?",
  "trovassi 50 euro mentri cammini per strada con un amico?",
  "un amico ti facesse capire che gli interessi?",
  "al lavoro un collega ti chiedesse di aiutarlo mentre tu sei indietro?",
  "il caporeparto incolpasse te di un errore non tuo?",
  "tua mamma ti accusasse di aver fumato?",
  "un negoziante sbagliasse a darti il resto e ti desse 2 euro in meno?",
  "sul pullman ti scappasse urgentemente di andare in bagno?",
  "i tuoi genitori litigassero furiosamente davanti a te?",
  "ti rubassero il portafogli in treno?",
  "un amico ti chiedesse di prestargli 10 euro?",
  "a casa da solo saltasse la corrente?",
  "un tuo vicino ti spiasse tutti i giorni dalla finestra?",
  "un amico rivelasse ad altri un tuo segreto?",
  "un amico ti prendesse in giro per le tue difficoltà?",
  "rimani chiuso fuori casa e non hai le chiavi con te?",
];

export const whatWouldYouDoCards = whatWouldYouDoWords.map(
  (word) => `Cosa faresti se ${word}`,
);
