/**
 * Rappresenta una carta del gioco.
 * Ogni carta ha un nome e una descrizione che definiscono o contenuto.
 */
export class Card {
  cardTitle: string;
  cardText: string;

  /**
   * Crea una nuova carta con nome e descrizione specificati.
   * @param cardTitle - Nome della carta o titolo, visibile
   * @param cardText - Descrizione della carta, nascosto o segreto
   */
  constructor(cardTitle: string, cardText: string) {
    this.cardTitle = cardTitle;
    this.cardText = cardText;
  }
}
