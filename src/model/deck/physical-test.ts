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
  "Batti 10 volte le mani sul tavolo alternandole",
  "Porta le ginocchia a terra e siediti sui talloni",
  "Cammina in equilibrio lungo una linea",
  "Toccati la punta dei piedi con le mani",
  "Fai 5 salti sul piede destro",
  "Fai 5 salti sul piede sinistro",
  "Stai 5 secondi in equilibrio sul piede destro",
  "Stai 5 secondi in equilibrio sul piede sinistro",
  "Fai una flessione",
  "Fai 2 addominali",
  "Fai 10 jumping jacks",
  "Cammina sulle punte per 10 passi",
  "Ruota le braccia in avanti 10 volte",
  "Ruota le braccia all'indietro 10 volte",
  "Fai 2 squat",
  "Stendi le braccia lateralmente e ruotale 10 volte",
  "Fai 10 passi di marcia sul posto",
  "Tieni le braccia tese in avanti per 10 secondi",
  "Salta una corda immaginaria per 10 secondi",
  "Fai 2 flessioni sulle ginocchia",
  "Cammina all'indietro per 5 passi",
  "Fai 2 giravolte",
];

export const physicalTestCards = physicalTestWords.map((word) => word);
