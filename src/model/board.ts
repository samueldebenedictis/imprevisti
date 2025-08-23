import { debugLog } from "@/debug-utils";
import type { Player } from "./player";
import { Square } from "./square";
import type { SquareJSON } from "./square/square";
import { squareFromJSON } from "./square/square-builder";

export interface PlayerPositionJSON {
  playerId: number;
  position: number;
}

export interface BoardJSON {
  squares: SquareJSON[];
  playersPosition: PlayerPositionJSON[];
}

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
   * @param players - Array dei giocatori da posizionare sul tabellone (usato per inizializzare se playersPositionMap non è fornito)
   * @param playersPositionMap - Mappa opzionale per inizializzare le posizioni dei giocatori (usato per la deserializzazione)
   */
  constructor(
    squares: Square[],
    players: Player[],
    playersPositionMap?: Map<Player, number>,
  ) {
    this.squares = squares;
    if (playersPositionMap) {
      this.playersPosition = playersPositionMap;
    } else {
      this.playersPosition = new Map(players.map((p) => [p, 0]));
    }
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
  getPlayerPosition = (player: Player) => {
    return this.playersPosition.get(player) as number;
  };

  /**
   * Sposta il giocatore specificato alla nuova posizione.
   * @param player - Il giocatore da spostare
   * @param position - La nuova posizione del giocatore
   */
  movePlayer = (player: Player, position: number) => {
    debugLog(
      `[Board.movePlayer] Attempting to move player: ${player.getName()} (ID: ${player.getId()}) to position: ${position}`,
    );
    debugLog(
      "[Board.movePlayer] PlayersPosition before:",
      Array.from(this.playersPosition.entries()).map(([p, pos]) => ({
        name: p.getName(),
        id: p.getId(),
        position: pos,
      })),
    );

    // Check if the player instance already exists as a key in the map
    let playerFound = false;
    for (const [keyPlayer, _] of this.playersPosition.entries()) {
      if (keyPlayer.getId() === player.getId()) {
        // Found the existing player instance, use it to update the map
        this.playersPosition.set(keyPlayer, position);
        playerFound = true;
        debugLog(
          `[Board.movePlayer] Updated existing player ${keyPlayer.getName()} (ID: ${keyPlayer.getId()}) position.`,
        );
        break;
      }
    }

    if (!playerFound) {
      // If the player instance was not found (e.g., a new instance with the same ID), add it.
      // This case should ideally not happen if GameModel.fromJSON correctly re-hydrates player instances.
      this.playersPosition.set(player, position);
      console.warn(
        `[Board.movePlayer] Added new player instance ${player.getName()} (ID: ${player.getId()}) to map. This might indicate an instance mismatch.`,
      );
    }

    debugLog(
      "[Board.movePlayer] PlayersPosition after:",
      Array.from(this.playersPosition.entries()).map(([p, pos]) => ({
        name: p.getName(),
        id: p.getId(),
        position: pos,
      })),
    );
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
  toJSON(): BoardJSON {
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
  static fromJSON(json: BoardJSON, players: Player[]): Board {
    const squares = json.squares.map((sJson) => squareFromJSON(sJson));

    // Ricostruisci playersPosition map direttamente
    const playersPositionMap = new Map<Player, number>();
    json.playersPosition.forEach((entry) => {
      const player = players.find((p) => p.getId() === entry.playerId);
      if (player) {
        playersPositionMap.set(player, entry.position);
      }
    });

    // Passa la mappa ricostruita al costruttore
    const board = new Board(squares, players, playersPositionMap);
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
