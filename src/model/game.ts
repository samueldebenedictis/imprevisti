import { Battle } from "./battle";
import { Board } from "./board";
import type { Card } from "./card";
import { Deck } from "./deck";
import { Dice } from "./dice";
import { GameContext } from "./gameContext";
import { Player } from "./player";
import { SpecialSquare, type Square } from "./square";

/**
 * Classe principale che gestisce la logica del gioco da tavolo.
 * Coordina tutti i componenti del gioco: giocatori, tabellone, dadi, carte e battaglie.
 */
export class Game {
  private boardSize: number;
  private board: Board;

  private players: Player[];
  private turn: number;
  private round: number;

  private dice: Dice;
  private deck: Deck;

  private gameEnded: boolean;
  private winner: Player | undefined;

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
    this.players = playersName.map((name, i) => new Player(i, name));
    this.board = new Board(squares, this.players);
    this.boardSize = this.board.getSquares().length;
    this.round = 1;
    this.turn = 0;
    this.dice = new Dice(diceFaces);
    this.deck = new Deck(cards);
    this.gameEnded = false;
  }

  /**
   * Restituisce il tabellone di gioco.
   * @returns L'istanza del tabellone corrente
   */
  getBoard = () => this.board;

  /**
   * Restituisce tutti i giocatori della partita.
   * @returns Array di tutti i giocatori
   */
  getPlayers = () => this.players;

  /**
   * Restituisce la posizione attuale del giocatore specificato.
   * @param player - Il giocatore di cui si vuole conoscere la posizione
   * @returns Posizione del giocatore sul tabellone
   */
  getPlayerPosition = (player: Player) => this.board.getPlayerPosition(player);

  /**
   * Restituisce l'indice del turno corrente.
   * @returns Indice del giocatore che deve giocare il turno corrente
   */
  getTurn = () => this.turn;

  /**
   * Restituisce il numero del round corrente.
   * @returns Numero del round attuale (inizia da 1)
   */
  getRound = () => this.round;

  /**
   * Restituisce il vincitore della partita, se presente.
   * @returns Il giocatore vincitore o undefined se la partita non è ancora terminata
   */
  getWinner = () => this.winner;

  /**
   * Termina la partita e imposta il vincitore.
   * @param player - Il giocatore vincitore
   */
  private endGameAndSetWinner = (player: Player) => {
    this.winner = player;
    this.gameEnded = true;
  };

  /**
   * Sposta un giocatore alla nuova posizione specificata.
   * Se la posizione supera la dimensione del tabellone, il giocatore viene posto all'ultima casella e vince.
   * Controlla automaticamente le collisioni con altri giocatori.
   * @param newPosition - La nuova posizione desiderata
   * @param actualPlayer - Il giocatore da spostare
   * @returns Un oggetto Battle se si verifica una collisione, null altrimenti
   */
  movePlayer = (newPosition: number, actualPlayer: Player): Battle | null => {
    const landingPosition =
      newPosition >= this.boardSize ? this.boardSize : newPosition;

    this.board.movePlayer(actualPlayer, landingPosition);

    if (landingPosition === this.boardSize) {
      this.endGameAndSetWinner(actualPlayer);
      return null; // Game ended, no collision possible
    }

    // Check for collision after moving
    return this.checkForCollision(actualPlayer);
  };

  /**
   * Il giocatore attuale lancia il dado e aggiorna la sua posizione.
   * Il turno ed eventualmente il round vengono incrementati.
   * Se un giocatore arriva all'ultima casella vince e il gioco termina.
   * Restituisce un oggetto Battle se si verifica una collisione, altrimenti null.
   */
  playTurn = (): Battle | null => {
    if (!this.gameEnded) {
      const actualPlayer = this.players[this.turn];
      const diceValue = this.dice.roll();
      const newPosition = this.getPlayerPosition(actualPlayer) + diceValue;

      const collision = this.movePlayer(newPosition, actualPlayer);
      if (collision) {
        // Battle needs to be resolved externally, but turn still advances
        this.advanceTurn();
        return collision;
      }

      // Continue with existing special square logic
      this.processSpecialSquareEffects(actualPlayer);

      this.advanceTurn();
    } else {
      throw new Error("playTurn not avalaible, the game is already ended");
    }
    return null;
  };

  /**
   * Elabora gli effetti delle caselle speciali per il giocatore specificato.
   * Verifica se la casella su cui si trova il giocatore è una casella speciale
   * ed esegue il comando associato.
   * @param player - Il giocatore per cui elaborare gli effetti della casella
   */
  private processSpecialSquareEffects = (player: Player) => {
    const landingSquare =
      this.board.getSquares()[this.getPlayerPosition(player)];
    if (landingSquare instanceof SpecialSquare) {
      const command = landingSquare.getCommand();
      command.execute(
        new GameContext(player, this.board, this.players, this.deck, this.dice),
      );
    }
  };

  /**
   * Avanza al turno successivo e incrementa il round se necessario.
   * Quando tutti i giocatori hanno giocato il loro turno, inizia un nuovo round.
   */
  private advanceTurn = () => {
    if (this.turn === this.players.length - 1) {
      this.turn = 0;
      this.round++;
    } else {
      this.turn++;
    }
  };

  /**
   * Controlla se il giocatore corrente è in collisione con altri giocatori sulla stessa casella.
   * @param currentPlayer - Il giocatore da controllare per le collisioni
   * @returns Un oggetto Battle se si verifica una collisione, null altrimenti
   */
  private checkForCollision = (currentPlayer: Player): Battle | null => {
    const position = this.getPlayerPosition(currentPlayer);
    const playersOnSquare = this.board.getPlayersOnSquare(position);

    if (playersOnSquare.length > 1) {
      // Find the other player (not the current one)
      const otherPlayer = playersOnSquare.find((p) => p !== currentPlayer);
      if (otherPlayer) {
        return new Battle(currentPlayer, otherPlayer);
      }
    }
    return null;
  };

  /**
   * Risolve una battaglia spostando il vincitore di una posizione in avanti.
   * Controlla se si verifica una nuova collisione nella posizione di destinazione.
   * @param battle - L'oggetto battaglia da risolvere
   * @param winner - Il giocatore vincitore della battaglia
   * @returns Un nuovo oggetto Battle se si verifica un'altra collisione, null altrimenti
   */
  resolveBattle = (battle: Battle, winner: Player): Battle | null => {
    // Validate that the winner is part of the battle
    battle.resolveBattle(winner);

    // Move winner forward one position
    const currentPos = this.getPlayerPosition(winner);
    const newCollision = this.movePlayer(currentPos + 1, winner);
    if (newCollision) {
      // Another battle needed
      return newCollision;
    }

    // Process special square effects on new position
    this.processSpecialSquareEffects(winner);

    return null;
  };

  /**
   * Metodo placeholder per la funzionalità mimo.
   * Attualmente non implementato.
   */
  playMime = () => {};
}
