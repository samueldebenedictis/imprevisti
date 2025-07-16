/**
 * Rappresenta una carta del gioco.
 * Ogni carta ha un nome e una descrizione che definiscono il suo effetto o contenuto.
 */
export class Card {
  description: string;
  name: string;

  /**
   * Crea una nuova carta con nome e descrizione specificati.
   * @param name - Nome della carta
   * @param description - Descrizione della carta che spiega il suo effetto
   */
  constructor(name: string, description: string) {
    this.description = description;
    this.name = name;
  }
}
