/**
 * Rappresenta un dado del gioco.
 * Genera valori casuali compresi tra 1 e il numero di facce specificato.
 */
export class Dice {
  faces: number;

  /**
   * Crea un nuovo dado con il numero di facce specificato.
   * @param faces - Numero di facce del dado (deve essere maggiore di 0)
   */
  constructor(faces: number) {
    this.faces = faces;
  }

  /**
   * Lancia il dado e restituisce un valore casuale.
   * @returns Valore casuale compreso tra 1 e il numero di facce del dado (inclusi)
   */
  roll = () => Math.floor(Math.random() * this.faces + 1);
}
