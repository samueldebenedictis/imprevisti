import { debugLog } from "@/debug-utils";
import type { Battle } from "./battle";
import { Board, type BoardJSON } from "./board";
import { type Deck, MimeDeck, QuizDeck } from "./deck";
import { Dice } from "./dice";
import {
  BattleManager,
  type GameActionResult,
  GameStateManager,
  MimeManager,
  MovementManager,
  QuizManager,
  SpecialSquareProcessor,
  TurnManager,
} from "./managers";
import { Player, type PlayerJSON } from "./player";
import { Mime, Quiz } from "./square";

export interface GameJSON {
  board: BoardJSON;
  players: PlayerJSON[];
  currentTurn: number;
  currentRound: number;
  gameEnded: boolean;
  winnerId?: number;
}

/**
 * Classe principale che gestisce la logica del gioco da tavolo.
 * Coordina tutti i componenti del gioco attraverso manager specializzati.
 */
export class Game {
  private board: Board;
  private dice: Dice;
  private mimeDeck: Deck;
  private quizDeck: Deck;

  // Manager per responsabilità specifiche
  private turnManager: TurnManager;
  private movementManager: MovementManager;
  private gameStateManager: GameStateManager;
  private specialSquareProcessor: SpecialSquareProcessor;
  private battleManager: BattleManager;
  private mimeManager: MimeManager;
  private quizManager: QuizManager;

  /**
   * Crea una nuova partita con i parametri specificati.
   * @param board - L'istanza del tabellone di gioco
   * @param players - Array delle istanze dei giocatori
   * @param diceFaces - Numero di facce del dado (opzionale, default 6)
   */
  constructor(board: Board, players: Player[], diceFaces = 6) {
    // Inizializzazione componenti base
    this.board = board;
    this.dice = new Dice(diceFaces);
    this.mimeDeck = new MimeDeck();
    this.quizDeck = new QuizDeck();

    // Inizializzazione manager
    this.turnManager = new TurnManager(players);
    this.gameStateManager = new GameStateManager(board.getSquares().length);
    this.movementManager = new MovementManager(
      this.board,
      this.gameStateManager,
    );
    this.specialSquareProcessor = new SpecialSquareProcessor(
      this.board,
      this.mimeDeck,
      this.quizDeck,
      this.dice,
      this.movementManager,
      this.gameStateManager,
    );
    this.battleManager = new BattleManager(
      this.movementManager,
      this.specialSquareProcessor,
      this.turnManager,
    );
    this.mimeManager = new MimeManager(this.movementManager);
    this.quizManager = new QuizManager(this.movementManager);
  }

  /**
   * Converte l'istanza di Game in un oggetto JSON serializzabile.
   * @returns Un oggetto che rappresenta lo stato del Game in formato JSON.
   */
  toJSON() {
    return {
      board: this.board.toJSON(),
      players: this.turnManager.getPlayers().map((p) => ({
        id: p.getId(),
        name: p.getName(),
        turnsToSkip: p.getTurnsToSkip(), // Usa il getter
      })),
      currentTurn: this.turnManager.getCurrentTurn(),
      currentRound: this.turnManager.getCurrentRound(),
      gameEnded: this.gameStateManager.isGameEnded(),
      winnerId: this.gameStateManager.getWinner()?.getId(),
    };
  }

  /**
   * Ricostruisce un'istanza di Game da un oggetto JSON.
   * Questo metodo è responsabile della deserializzazione completa dello stato del gioco,
   * ricreando correttamente tutte le istanze di classi annidate (Board, Player, Managers).
   * @param json - L'oggetto JSON da cui ricostruire il Game.
   * @returns Una nuova istanza di Game.
   */
  static fromJSON(json: GameJSON): Game {
    const players: Player[] = json.players.map((p: PlayerJSON) => {
      const player = new Player(p.id, p.name);
      player.setTurnsToSkip(p.turnsToSkip); // Usa il setter
      return player;
    });

    const board = Board.fromJSON(json.board, players);

    const game = new Game(board, players);

    game.turnManager = TurnManager.fromJSON(
      json.currentTurn,
      json.currentRound,
      players,
    );

    const reconstructedGameStateManager = GameStateManager.fromJSON(
      board.getSquares().length,
      json.gameEnded,
      json.winnerId,
      players,
    );
    game.gameStateManager = reconstructedGameStateManager;

    // Update managers with the reconstructed GameStateManager
    game.movementManager = new MovementManager(
      game.board,
      reconstructedGameStateManager,
    );
    game.specialSquareProcessor = new SpecialSquareProcessor(
      game.board,
      game.mimeDeck,
      game.quizDeck,
      game.dice,
      game.movementManager, // movementManager also needs to be updated first
      reconstructedGameStateManager,
    );
    game.battleManager = new BattleManager(
      game.movementManager,
      game.specialSquareProcessor,
      game.turnManager,
    );
    game.mimeManager = new MimeManager(game.movementManager);
    game.quizManager = new QuizManager(game.movementManager);

    debugLog("[Game.fromJSON] Reconstructed Game instance:", game);
    debugLog(
      "[Game.fromJSON] Reconstructed Players:",
      game.turnManager.getPlayers().map((p) => ({
        id: p.getId(),
        name: p.getName(),
        turnsToSkip: p.getTurnsToSkip(),
      })),
    );
    return game;
  }

  /**
   * Il giocatore attuale lancia il dado e aggiorna la sua posizione.
   * Il turno viene automaticamente incrementato alla fine dell'azione.
   * @returns Risultato dell'azione di gioco (battaglia, mimo o nessuna azione speciale)
   * @throws Errore se il gioco è già terminato
   */
  playTurn(): GameActionResult {
    this.validateGameState();

    const currentPlayer = this.turnManager.getCurrentPlayer();

    if (currentPlayer.mustSkipTurn()) {
      this.turnManager.advanceTurn();
      return { type: "none", diceResult: 0, actionType: null }; // Return default values for skipped turn
    }
    const diceValue = this.dice.roll();
    const result = this.executePlayerTurn(currentPlayer, diceValue);
    this.turnManager.advanceTurn();

    return { ...result, diceResult: diceValue };
  }

  /**
   * Valida che il gioco sia in uno stato valido per continuare.
   * @throws Errore se il gioco è già terminato
   */
  private validateGameState(): void {
    debugLog("Terminato?", this.gameStateManager.isGameEnded());
    if (this.gameStateManager.isGameEnded()) {
      throw new Error("Cannot play turn: game has already ended");
    }
  }

  /**
   * Esegue il turno di un giocatore specifico.
   * @param player - Il giocatore che deve giocare il turno
   * @returns Risultato dell'azione di gioco
   */
  private executePlayerTurn(
    player: Player,
    diceValue: number,
  ): GameActionResult {
    const currentPosition = this.board.getPlayerPosition(player);
    const newPosition = currentPosition + diceValue;
    // Gestione movimento e collisioni
    const movementResult = this.movementManager.movePlayerAndCheckCollision(
      player,
      newPosition,
    );

    if (movementResult.gameEnded) {
      return { type: "none", diceResult: diceValue, actionType: null }; // Gioco terminato, nessuna azione aggiuntiva
    }

    if (movementResult.collision) {
      return {
        type: "battle",
        data: movementResult.collision,
        diceResult: diceValue,
        actionType: "battle",
      };
    }

    // Gestione effetti caselle speciali
    const specialAction = this.specialSquareProcessor.processSquareEffects(
      player,
      this.getPlayers(),
    );

    // Se è un'azione speciale, la gestisco
    if (specialAction) {
      if (specialAction instanceof Mime) {
        return {
          type: "mime",
          data: specialAction,
          diceResult: diceValue,
          actionType: "mime",
        };
      }
      if (specialAction instanceof Quiz) {
        return {
          type: "quiz",
          data: specialAction,
          diceResult: diceValue,
          actionType: "quiz",
        };
      }
    }

    return { type: "none", diceResult: diceValue, actionType: null };
  }

  /**
   * Risolve una battaglia utilizzando il BattleManager.
   * @param battle - L'oggetto battaglia da risolvere
   * @param winner - Il giocatore vincitore della battaglia
   * @returns Un nuovo oggetto Battle se si verifica un'altra collisione, null altrimenti
   */
  resolveBattle(battle: Battle, winner: Player): GameActionResult {
    // When resolving a battle, we don't have a new dice roll, so we pass 0 or a placeholder.
    // The actionType will be determined by the battle resolution itself.
    return this.battleManager.resolveBattle(battle, winner, 0);
  }

  /**
   * Risolve un'azione di mimo utilizzando il MimeManager.
   * @param mimeAction - L'oggetto Mime da risolvere
   * @param success - True se il mimo è stato indovinato, false altrimenti
   * @param guessPlayer - Il giocatore che ha indovinato il mimo (richiesto se success è true)
   * @returns Array con eventuali collisioni risultanti dal movimento dei giocatori
   */
  resolveMime(
    mimeAction: Mime,
    success: boolean,
    guessPlayer?: Player,
  ): [Battle | null, Battle | null] {
    return this.mimeManager.resolveMime(mimeAction, success, guessPlayer);
  }

  /**
   * Risolve un'azione di quiz utilizzando il QuizManager.
   * @param quizAction - L'oggetto Quiz da risolvere
   * @param success - True se la risposta è corretta, false altrimenti
   * @returns Un oggetto Battle se si verifica una collisione, null altrimenti
   */
  resolveQuiz(quizAction: Quiz, success: boolean): Battle | null {
    return this.quizManager.resolveQuiz(quizAction, success);
  }

  // Getter per accesso ai dati del gioco
  /**
   * Restituisce il tabellone di gioco.
   * @returns L'istanza del tabellone corrente
   */
  getBoard(): Board {
    return this.board;
  }

  /**
   * Restituisce tutti i giocatori della partita.
   * @returns Array di tutti i giocatori
   */
  getPlayers(): Player[] {
    return this.turnManager.getPlayers();
  }

  /**
   * Restituisce la posizione attuale del giocatore specificato.
   * @param player - Il giocatore di cui si vuole conoscere la posizione
   * @returns Posizione del giocatore sul tabellone
   */
  getPlayerPosition(player: Player): number {
    return this.board.getPlayerPosition(player);
  }

  /**
   * Restituisce l'indice del turno corrente.
   * @returns Indice del giocatore che deve giocare il turno corrente
   */
  getTurn(): number {
    return this.turnManager.getCurrentTurn();
  }

  /**
   * Restituisce il numero del round corrente.
   * @returns Numero del round attuale (inizia da 1)
   */
  getRound(): number {
    return this.turnManager.getCurrentRound();
  }

  /**
   * Restituisce il vincitore della partita, se presente.
   * @returns Il giocatore vincitore o undefined se la partita non è ancora terminata
   */
  getWinner(): Player | undefined {
    return this.gameStateManager.getWinner();
  }

  /**
   * Verifica se il gioco è terminato.
   * @returns True se il gioco è terminato, false altrimenti
   */
  isGameEnded(): boolean {
    return this.gameStateManager.isGameEnded();
  }
}
