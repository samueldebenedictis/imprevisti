import type { Player } from "../player";
import type { Card } from "./card";

export class PhysicalTest {
  /**
   * Crea una nuova istanza di PhysicalTest.
   * @param physicalTestPlayer - Il giocatore che deve eseguire il test fisico.
   * @param cardTest - Il test fisico da eseguire (simulata da una carta).
   */
  constructor(
    public physicalTestPlayer: Player,
    public cardTest: Card,
  ) {}
}

export const physicalTestWords = [
  "Fare 10 flessioni",
  "Saltare la corda per 30 secondi",
  "Fare il ponte per 10 secondi",
  "Correre sul posto per 20 secondi",
  "Fare 5 squat",
  "Tenere l'equilibrio su una gamba per 15 secondi",
  "Fare 10 jumping jack",
  "Fare il plank per 20 secondi",
  "Saltare 5 volte consecutive",
  "Fare 10 addominali",
  "Girare su se stessi 10 volte",
  "Fare 5 burpees",
  "Tenere una posizione yoga per 15 secondi",
  "Fare 10 mountain climbers",
  "Saltare con le gambe unite per 20 secondi",
  "Fare 5 push-up",
  "Correre in cerchio per 10 secondi",
  "Fare 10 sit-up",
  "Saltare la cavallina immaginaria 10 volte",
  "Fare 5 star jumps",
];

export const physicalTestCards = physicalTestWords.map((word) => word);
