import type { Player } from "../player";
import type { Card } from "./card";

export class BackWrite {
  /**
   * Crea una nuova istanza di BackWrite.
   * @param backWritePlayer - Il giocatore che deve scrivere sulla schiena.
   * @param cardTopic - La parola da scrivere (simulata da una carta).
   */
  constructor(
    public backWritePlayer: Player,
    public cardTopic: Card,
  ) {}
}

export const backWriteWords = [
  "Casa",
  "Albero",
  "Sole",
  "Mare",
  "Montagna",
  "Fiume",
  "Cielo",
  "Stella",
  "Luna",
  "Gatto",
  "Cane",
  "Uccello",
  "Pesce",
  "Fiore",
  "Libro",
  "Telefono",
  "Auto",
  "Treno",
  "Aereo",
  "Bicicletta",
  "Palla",
  "Giocattolo",
  "Cibo",
  "Acqua",
  "Fuoco",
  "Terra",
  "Aria",
  "Vento",
  "Pioggia",
  "Neve",
];

export const backWriteCards = backWriteWords.map((word) => word);
