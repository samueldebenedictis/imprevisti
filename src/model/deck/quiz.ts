import type { Player } from "../player";
import type { Card } from "./card";

/**
 * Represents a quiz action in the game.
 * It holds the player who has to answer the quiz and the card with the question.
 */
export class Quiz {
  /**
   * Creates a new instance of Quiz.
   * @param quizPlayer - The player who has to answer the quiz.
   * @param cardTopic - The card containing the quiz question.
   */
  constructor(
    public quizPlayer: Player,
    public cardTopic: Card,
  ) {}
}

export const quizCards = [
  { domanda: "Cosa indossi quando fa freddo?", risposta: "La giacca" },
  { domanda: "Cosa si usa per tagliare la carta?", risposta: "Le forbici" },
  { domanda: "Cosa metti nei piedi per uscire?", risposta: "Le scarpe" },
  { domanda: "Quanti giorni ci sono in una settimana?", risposta: "Sette" },
  { domanda: "Che mese viene dopo marzo?", risposta: "Aprile" },
  { domanda: "Cosa fai con le orecchie?", risposta: "Ascolto" },
  { domanda: "Qual è il contrario di aperto?", risposta: "Chiuso" },
  { domanda: "Dove si conservano i cibi freddi?", risposta: "Nel frigorifero" },
  { domanda: "Quanti minuti ci sono in un’ora?", risposta: "Sessanta" },
  {
    domanda: "Cosa usi per asciugarti dopo la doccia?",
    risposta: "L’asciugamano",
  },
  { domanda: "Dove metti i vestiti sporchi?", risposta: "Nel cesto" },
  {
    domanda: "Che giorno della settimana viene dopo venerdì?",
    risposta: "Sabato",
  },
  {
    domanda: "Come si chiama la persona che insegna a scuola?",
    risposta: "Insegnante",
  },
  {
    domanda: "Cosa usi per guardare la televisione?",
    risposta: "Il telecomando",
  },
  {
    domanda: "Dove si trovano libri e quaderni a scuola?",
    risposta: "Nello zaino",
  },
  { domanda: "Quale bevanda si beve calda a colazione?", risposta: "Il latte" },
  {
    domanda: "Che animale depone le uova e ha le piume?",
    risposta: "La gallina",
  },
  { domanda: "Cosa indossi quando piove?", risposta: "L’impermeabile" },
  { domanda: "Cosa usi per controllare l’ora?", risposta: "L’orologio" },
  { domanda: "Quante dita ha una mano?", risposta: "Cinque" },
  {
    domanda: "Come si chiama il posto dove vai quando sei malato?",
    risposta: "L’ospedale",
  },
  { domanda: "Dove si mettono i soldi?", risposta: "Nel portafoglio" },
  {
    domanda: "Come si chiama la persona che guida l’autobus?",
    risposta: "Autista",
  },
  {
    domanda: "Cosa si accende per illuminare una stanza?",
    risposta: "La luce",
  },
  { domanda: "Cosa usi per tagliare la carne?", risposta: "Il coltello" },
  { domanda: "In quale stagione cadono le foglie?", risposta: "In autunno" },
  {
    domanda: "Cosa metti in testa quando c’è il sole forte?",
    risposta: "Il cappello",
  },
  { domanda: "Quale frutto è giallo e lungo?", risposta: "La banana" },
  {
    domanda: "Quale animale vive nell’acqua e ha le pinne?",
    risposta: "Il pesce",
  },
  { domanda: "Cosa si usa per cancellare la matita?", risposta: "La gomma" },
  {
    domanda: "Come si chiama il frutto rosso con tanti semini?",
    risposta: "La fragola",
  },
  {
    domanda: "Come si chiama il posto dove si comprano medicine?",
    risposta: "La farmacia",
  },
  {
    domanda: "Come si chiama il luogo dove si compra da mangiare?",
    risposta: "Il supermercato",
  },
  {
    domanda: "Come si chiama l’oggetto per vedere meglio da lontano?",
    risposta: "Il binocolo",
  },
  { domanda: "Che animale ha la proboscide?", risposta: "L’elefante" },
  {
    domanda: "Come si chiama il luogo dove si nuota in città?",
    risposta: "La piscina",
  },
  { domanda: "Qual è il giorno prima della domenica?", risposta: "Sabato" },
  {
    domanda: "Come si chiama il mezzo che vola nel cielo con i passeggeri?",
    risposta: "L’aereo",
  },
  {
    domanda: "Cosa fai prima di andare a dormire?",
    risposta: "Mi lavo i denti",
  },
  { domanda: "Cosa usi per vedere la strada al buio?", risposta: "La torcia" },
  {
    domanda: "Come si chiama il posto dove crescono gli alberi?",
    risposta: "Il bosco",
  },
  {
    domanda: "Qual è il frutto rosso con i semini all’interno?",
    risposta: "La mela",
  },
  {
    domanda: "Come si chiama il pasto che si fa a metà giornata?",
    risposta: "Il pranzo",
  },
  { domanda: "Dove vai per studiare con i libri?", risposta: "A scuola" },
  { domanda: "Cosa serve per prendere appunti?", risposta: "Un quaderno" },
  {
    domanda: "Cosa metti sulla pelle quando vai al sole?",
    risposta: "La crema solare",
  },
  { domanda: "Cosa si usa per lavare i capelli?", risposta: "Lo shampoo" },
  {
    domanda: "Dove si guarda un film con tante persone?",
    risposta: "Al cinema",
  },
  {
    domanda: "Come si chiama l'oggetto che ti dice che ora è?",
    risposta: "Orologio",
  },
];
