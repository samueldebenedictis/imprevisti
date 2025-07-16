import { Battle } from "./battle";
import { Board } from "./board";
import type { Card } from "./card";
import { Deck } from "./deck";
import { Dice } from "./dice";
import { Player } from "./player";
import { type Mime, type Square } from "./square";
import {
  GameStateManager,
  MovementManager,
  SpecialSquareProcessor,
  TurnManager,
  type GameActionResult,
  type MovementResult,
} from "./managers";

/**
 * Classe principale che gestisce la logica del gioco da tavolo.
 * Coordina tutti i componenti del gioco attraverso manager specializzati.
 */
export class Game {
  private board: Board;
  private dice: Dice;
  private deck: Deck;

  // Manager per responsabilità specifiche
  private turnManager: TurnManager;
  private movementManager: MovementManager;
  private gameStateManager: GameStateManager;
  private specialSquareProcessor: SpecialSquareProcessor;

  /**
   * Crea una nuova partita con i parametri specificati.
   * @param squares - Array delle caselle che compongono il tabellone
   * @param playersName - Array dei nomi dei giocatori
   * @param cards - Array delle carte del gioco (opzionale, default array vuoto)
   * @param diceFaces - Numero di facce del dado (opzionale, default 6)
   */
  constructor(
    squares: Square[],
    playersName: string[],
    cards: Card[] = [],
    diceFaces = 6,
  ) {
    // Inizializzazione componenti base
    const players = playersName.map((name, i) => new Player(i, name));
    this.board = new Board(squares, players);
    this.dice = new Dice(diceFaces);
    this.deck = new Deck(cards);

    // Inizializzazione manager
    this.turnManager = new TurnManager(players);
    this.gameStateManager = new GameStateManager(squares.length);
    this.movementManager = new MovementManager(this.board, this.gameStateManager);
    this.specialSquareProcessor = new SpecialSquareProcessor(
      this.board,
      this.deck,
      this.dice
    );
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
      return { type: 'none' };
    }

    const result = this.executePlayerTurn(currentPlayer);
    this.turnManager.advanceTurn();

    return result;
  }

  /**
   * Valida che il gioco sia in uno stato valido per continuare.
   * @throws Errore se il gioco è già terminato
   */
  private validateGameState(): void {
    if (this.gameStateManager.isGameEnded()) {
      throw new Error("Cannot play turn: game has already ended");
    }
  }

  /**
   * Esegue il turno di un giocatore specifico.
   * @param player - Il giocatore che deve giocare il turno
   * @returns Risultato dell'azione di gioco
   */
  private executePlayerTurn(player: Player): GameActionResult {
    const diceValue = this.dice.roll();
    const currentPosition = this.board.getPlayerPosition(player);
    const newPosition = currentPosition + diceValue;

    // Gestione movimento e collisioni
    const movementResult = this.movementManager.movePlayerAndCheckCollision(
      player,
      newPosition
    );

    if (movementResult.gameEnded) {
      return { type: 'none' }; // Gioco terminato, nessuna azione aggiuntiva
    }

    if (movementResult.collision) {
      return { type: 'battle', data: movementResult.collision };
    }

    // Gestione effetti caselle speciali
    const specialAction = this.specialSquareProcessor.processSquareEffects(
      player,
      this.turnManager.getPlayers()
    );

    // Se è mimo restituisco specialAction
    if (specialAction) {
      return { type: 'mime', data: specialAction };
    }

    return { type: 'none' };
  }

  /**
   * Risolve una battaglia spostando il vincitore di una posizione in avanti.
   * Controlla se si verifica una nuova collisione nella posizione di destinazione.
   * @param battle - L'oggetto battaglia da risolvere
   * @param winner - Il giocatore vincitore della battaglia
   * @returns Un nuovo oggetto Battle se si verifica un'altra collisione, null altrimenti
   */
  resolveBattle(battle: Battle, winner: Player): Battle | null {
    // Valida che il vincitore sia parte della battaglia
    battle.resolveBattle(winner);

    // Sposta il vincitore in avanti di una posizione
    const movementResult = this.movementManager.moveWinnerForward(winner);

    if (movementResult.gameEnded) {
      return null; // Gioco terminato, nessuna collisione possibile
    }

    if (movementResult.collision) {
      return movementResult.collision; // Nuova battaglia necessaria
    }

    // Elabora gli effetti delle caselle speciali nella nuova posizione
    this.specialSquareProcessor.processSquareEffects(
      winner,
      this.turnManager.getPlayers()
    );

    return null;
  }

  /**
   * Risolve un'azione di mimo, applicando gli effetti in base al successo o fallimento.
   * @param mimeAction - L'oggetto Mime da risolvere
   * @param success - True se il mimo è stato indovinato, false altrimenti
   * @param guessPlayer - Il giocatore che ha indovinato il mimo (richiesto se success è true)
   * @returns Array con eventuali collisioni risultanti dal movimento dei giocatori
   */
  resolveMime(
    mimeAction: Mime,
    success: boolean,
    guessPlayer?: Player
  ): [Battle | null, Battle | null] {
    if (success && guessPlayer) {
      return this.handleMimeSuccess(mimeAction.mimePlayer, guessPlayer);
    } else {
      this.handleMimeFailure(mimeAction.mimePlayer);
      return [null, null];
    }
  }

  /**
   * Gestisce il successo del mimo spostando entrambi i giocatori in avanti.
   * @param mimePlayer - Il giocatore che ha eseguito il mimo
   * @param guessPlayer - Il giocatore che ha indovinato il mimo
   * @returns Array con eventuali collisioni per entrambi i giocatori
   */
  private handleMimeSuccess(
    mimePlayer: Player,
    guessPlayer: Player
  ): [Battle | null, Battle | null] {
    const [result1, result2] = this.movementManager.moveBothPlayersForward(
      mimePlayer,
      guessPlayer
    );

    return [result1.collision, result2.collision];
  }

  /**
   * Gestisce il fallimento del mimo facendo saltare il prossimo turno al giocatore.
   * @param mimePlayer - Il giocatore che ha eseguito il mimo
   */
  private handleMimeFailure(mimePlayer: Player): void {
    mimePlayer.skipNextTurn();
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
