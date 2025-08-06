import type { Player } from "./player";
import { Square } from "./square";

/**
 * Gestisce il tabellone di gioco e le posizioni dei giocatori.
 * Mantiene traccia delle caselle del tabellone e della posizione di ogni giocatore.
 */
export class Board {
  private squares: Square[];
  private playersPosition: Map<Player, number>;

  /**
   * Crea un nuovo tabellone con le caselle specificate e inizializza le posizioni dei giocatori.
   * Tutti i giocatori iniziano dalla posizione 0.
   * @param squares - Array delle caselle del tabellone
   * @param players - Array dei giocatori da posizionare sul tabellone
   */
  constructor(squares: Square[], players: Player[]) {
    this.squares = squares;
    this.playersPosition = new Map(players.map((p) => [p, 0]));
  }

  /**
   * Restituisce tutte le caselle del tabellone.
   * @returns Array di tutte le caselle del tabellone
   */
  getSquares = () => this.squares;

  /**
   * Restituisce la posizione attuale del giocatore specificato.
   * @param player - Il giocatore di cui si vuole conoscere la posizione
   * @returns Indice della posizione del giocatore sul tabellone
   */
  getPlayerPosition = (player: Player) =>
    this.playersPosition.get(player) as number;

  /**
   * Sposta il giocatore specificato alla nuova posizione.
   * @param player - Il giocatore da spostare
   * @param position - La nuova posizione del giocatore
   */
  movePlayer = (player: Player, position: number) => {
    this.playersPosition.set(player, position);
  };

  /**
   * Restituisce tutti i giocatori attualmente presenti sulla casella specificata.
   * @param position - L'indice della casella da controllare
   * @returns Array dei giocatori presenti sulla casella
   */
  getPlayersOnSquare = (position: number): Player[] => {
    return Array.from(this.playersPosition.entries())
      .filter(([_player, pos]) => pos === position)
      .map(([player, _pos]) => player);
  };

  /**
   * Converte l'istanza di Board in un oggetto JSON serializzabile.
   * @returns Un oggetto che rappresenta lo stato della Board in formato JSON.
   */
  toJSON() {
    return {
      squares: this.squares.map((s) => s.toJSON()), // Ora serializziamo l'intera Square
      playersPosition: Array.from(this.playersPosition.entries()).map(
        ([player, position]) => ({
          playerId: player.getId(),
          position: position,
        }),
      ),
    };
  }

  /**
   * Ricostruisce un'istanza di Board da un oggetto JSON.
   * @param json - L'oggetto JSON da cui ricostruire la Board.
   * @param players - Un array di istanze Player già ricostruite.
   * @returns Una nuova istanza di Board.
   */
  static fromJSON(json: any, players: Player[]): Board {
    const squares = json.squares.map((sJson: any) => Square.fromJSON(sJson)); // Usa Square.fromJSON
    const board = new Board(squares, []); // Inizializza con un array vuoto di giocatori

    // Ricostruisci playersPosition
    json.playersPosition.forEach((entry: any) => {
      const player = players.find((p) => p.getId() === entry.playerId);
      if (player) {
        board.movePlayer(player, entry.position);
      }
    });

    return board;
  }
}

/**
 * Builder per la costruzione delle caselle del tabellone.
 * Utilizza il pattern Builder per creare un array di caselle con dimensione specificata.
 */
export class SquaresBuilder {
  private squares: Square[] | undefined;
  private boardSize: number | undefined;

  /**
   * Imposta la dimensione del tabellone.
   * @param size - Numero di caselle del tabellone
   * @returns L'istanza del builder per il method chaining
   */
  setBoardSize = (size: number) => {
    this.boardSize = size;
    return this;
  };

  /**
   * Costruisce e restituisce l'array delle caselle del tabellone.
   * Crea caselle numerate da 0 alla dimensione specificata - 1.
   * @returns Array delle caselle create
   * @throws Errore se la dimensione non è stata definita
   */
  build() {
    if (this.boardSize === undefined) {
      throw new Error("Size not defined");
    }
    const squaresNumbers = Array.from({ length: this.boardSize }, (_, i) => i);
    this.squares = squaresNumbers.map((n) => new Square(n));
    return this.squares;
  }
}
