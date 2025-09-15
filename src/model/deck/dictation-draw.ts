import type { Player } from "../player";
import type { Card } from "./card";

export class DictationDraw {
  /**
   * Creates a new instance of DictationDraw.
   * @param drawingPlayer - The player who must describe the drawing.
   * @param cardTopic - The drawing theme (simulated by a card with image).
   */
  constructor(
    public drawingPlayer: Player,
    public cardTopic: Card,
    public imageUrl: string,
  ) {}
}

export const dictationDrawImages = [
  {
    name: "Casa",
    description: "Una semplice casa con tetto e porta",
    imageUrl: "/images/dictation-draw/house.svg",
  },
  {
    name: "Albero",
    description: "Un albero con tronco e foglie",
    imageUrl: "/images/dictation-draw/tree.svg",
  },
  {
    name: "Sole",
    description: "Un sole con raggi",
    imageUrl: "/images/dictation-draw/sun.svg",
  },
  {
    name: "Cuore",
    description: "Un cuore stilizzato",
    imageUrl: "/images/dictation-draw/heart.svg",
  },
  {
    name: "Stella",
    description: "Una stella a cinque punte",
    imageUrl: "/images/dictation-draw/star.svg",
  },
  {
    name: "Fiori",
    description: "Un mazzo di fiori",
    imageUrl: "/images/dictation-draw/flowers.svg",
  },
  {
    name: "Montagna",
    description: "Una montagna",
    imageUrl: "/images/dictation-draw/mountain.svg",
  },
  {
    name: "Mare",
    description: "Onde del mare",
    imageUrl: "/images/dictation-draw/sea.svg",
  },
  {
    name: "Auto",
    description: "Un'auto stilizzata",
    imageUrl: "/images/dictation-draw/car.svg",
  },
  {
    name: "Aereo",
    description: "Un aereo in volo",
    imageUrl: "/images/dictation-draw/airplane.svg",
  },
  {
    name: "Libro",
    description: "Un libro aperto",
    imageUrl: "/images/dictation-draw/book.svg",
  },
  {
    name: "Orologio",
    description: "Un orologio da parete",
    imageUrl: "/images/dictation-draw/clock.svg",
  },
  {
    name: "Chiave",
    description: "Una semplice chiave",
    imageUrl: "/images/dictation-draw/key.svg",
  },
  {
    name: "Telefono",
    description: "Un telefono cellulare",
    imageUrl: "/images/dictation-draw/phone.svg",
  },
  {
    name: "Cappello",
    description: "Un cappello",
    imageUrl: "/images/dictation-draw/hat.svg",
  },
  {
    name: "Pesce",
    description: "Un pesce con pinne e coda",
    imageUrl: "/images/dictation-draw/fish.svg",
  },
  {
    name: "Uccello",
    description: "Un uccello in volo",
    imageUrl: "/images/dictation-draw/bird.svg",
  },
  {
    name: "Gatto",
    description: "Un gatto seduto",
    imageUrl: "/images/dictation-draw/cat.svg",
  },
  {
    name: "Cane",
    description: "Un cane",
    imageUrl: "/images/dictation-draw/dog.svg",
  },
  {
    name: "Farfalla",
    description: "Una farfalla",
    imageUrl: "/images/dictation-draw/butterfly.svg",
  },
];

export const dictationDrawCards = dictationDrawImages.map(
  (el) => `${el.name}: ${el.description}`,
);
