import type { Card } from "./card";

/**
 * Stato salvabile di un mazzo: le carte ancora da pescare, come indici nella
 * lista completa (l'ultima dell'elenco è la prossima), e l'ultima pescata.
 */
export interface DeckJSON {
  pile: number[];
  last?: number;
}

const isIndex = (v: unknown, size: number): v is number =>
  typeof v === "number" && Number.isInteger(v) && v >= 0 && v < size;

/**
 * Gestisce il mazzo di carte del gioco.
 * Pesca senza ripetizioni: una carta torna solo dopo che sono uscite tutte le
 * altre. Lo stato (carte rimaste) si salva con la partita, così il mazzo non
 * ricomincia da capo quando la partita viene ricostruita dal JSON.
 */
export class Deck {
  private readonly cards: Card[];
  private pile: number[];
  private last: number | undefined;

  /**
   * Crea un nuovo mazzo con le carte specificate, già mescolato.
   * @param cards - Array delle carte che compongono il mazzo
   */
  constructor(cards: Card[]) {
    this.cards = cards;
    this.pile = cards.map((_, i) => i);
    this.last = undefined;
    this.shuffle();
  }

  /**
   * Mescola le carte rimaste nel mazzo (Fisher-Yates).
   */
  shuffle = () => {
    for (let i = this.pile.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.pile[i], this.pile[j]] = [this.pile[j], this.pile[i]];
    }
  };

  /**
   * Restituisce il numero di carte rimanenti nel mazzo.
   * @returns Numero di carte disponibili nel mazzo
   */
  cardCount = () => {
    return this.pile.length;
  };

  /**
   * Pesca una carta dal mazzo.
   * Se il mazzo è vuoto, rimette dentro tutte le carte e rimescola, evitando
   * che la prima carta del nuovo giro sia uguale all'ultima uscita.
   * @returns La carta pescata dal mazzo
   */
  draw = () => {
    if (this.pile.length === 0) {
      this.pile = this.cards.map((_, i) => i);
      this.shuffle();
      const top = this.pile.length - 1;
      if (top > 0 && this.pile[top] === this.last)
        [this.pile[0], this.pile[top]] = [this.pile[top], this.pile[0]];
    }
    const index = this.pile.pop() as number;
    this.last = index;
    return this.cards[index];
  };

  /** Stato del mazzo da salvare con la partita. */
  toJSON = (): DeckJSON =>
    this.last === undefined
      ? { pile: [...this.pile] }
      : { pile: [...this.pile], last: this.last };

  /**
   * Riprende lo stato salvato. Se non è coerente con le carte del mazzo
   * (indici fuori misura o ripetuti, ad esempio da una versione diversa del
   * gioco) lo ignora e il mazzo resta appena mescolato.
   * @returns true se lo stato è stato ripreso
   */
  restore = (state: unknown): boolean => {
    if (typeof state !== "object" || state === null) return false;
    const { pile, last } = state as Record<string, unknown>;
    const size = this.cards.length;
    if (!Array.isArray(pile) || !pile.every((i) => isIndex(i, size)))
      return false;
    if (new Set(pile).size !== pile.length) return false;
    if (last !== undefined && !isIndex(last, size)) return false;
    this.pile = [...pile];
    this.last = last;
    return true;
  };
}
