import type { Player } from "../player";
import type { Card } from "./card";

export class Draw {
  /**
   * Crea una nuova istanza di Draw.
   * @param drawPlayer - Il giocatore che deve disegnare la parola.
   * @param cardTopic - La parola da disegnare (simulata da una carta).
   */
  constructor(
    public drawPlayer: Player,
    public cardTopic: Card,
  ) {}
}

export const drawWords = [
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

export const drawCards = drawWords.map((word) => word);
