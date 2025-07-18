import type { Card } from "./card";

/**
 * Gestisce il mazzo di carte del gioco.
 * Mantiene traccia delle carte disponibili e di quelle già utilizzate,
 * con funzionalità di mescolamento e riciclo automatico.
 */
export class Deck {
  private cards: Card[];
  private usedCards: Card[];

  /**
   * Crea un nuovo mazzo con le carte specificate.
   * @param cards - Array delle carte che compongono il mazzo iniziale
   */
  constructor(cards: Card[]) {
    this.cards = cards;
    this.usedCards = [];
  }

  /**
   * Mescola le carte del mazzo in ordine casuale.
   * Utilizza l'algoritmo Fisher-Yates per garantire una distribuzione uniforme.
   */
  shuffle = () => {
    const unshuffled = this.cards.map((el) => ({
      card: el,
      value: Math.random(),
    }));
    const shuffled = unshuffled.sort((a, b) => a.value - b.value);
    this.cards = shuffled.map((el) => el.card);
  };

  /**
   * Restituisce il numero di carte rimanenti nel mazzo.
   * @returns Numero di carte disponibili nel mazzo
   */
  cardCount = () => {
    return this.cards.length;
  };

  /**
   * Pesca una carta dal mazzo.
   * Se il mazzo è vuoto, rimescola automaticamente le carte usate.
   * @returns La carta pescata dal mazzo
   */
  draw = () => {
    if (this.cards.length === 0) {
      this.cards = this.usedCards;
      this.shuffle();
    }
    const card = this.cards.pop();
    this.usedCards.push(card as Card);
    return card as Card;
  };
}
