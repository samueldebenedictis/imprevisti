import { Battle } from "./battle";
import { Board } from "./board";
import type { Card } from "./card";
import { Deck } from "./deck";
import { Dice } from "./dice";
import { GameContext } from "./gameContext";
import { Player } from "./player";
import { SpecialSquare, type Square } from "./square/square";

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

  getBoard = () => this.board;
  getPlayers = () => this.players;

  getPlayerPosition = (player: Player) => this.board.getPlayerPosition(player);

  getTurn = () => this.turn;
  getRound = () => this.round;

  getWinner = () => this.winner;

  private endGameAndSetWinner = (player: Player) => {
    this.winner = player;
    this.gameEnded = true;
  };

  movePlayer = (newPosition: number, actualPlayer: Player) => {
    const landingPosition =
      newPosition >= this.boardSize ? this.boardSize : newPosition;

    if (landingPosition === this.boardSize) {
      this.endGameAndSetWinner(actualPlayer);
    }

    this.board.movePlayer(actualPlayer, landingPosition);
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

      this.movePlayer(newPosition, actualPlayer);

      // Check for collision immediately after move
      const collision = this.checkForCollision(actualPlayer);
      if (collision) {
        // Battle needs to be resolved externally
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
   * Processes special square effects for the given player.
   */
  private processSpecialSquareEffects = (player: Player) => {
    const landingSquare =
      this.board.getSquares()[this.getPlayerPosition(player)];
    if (landingSquare instanceof SpecialSquare) {
      const command = landingSquare.getCommand();
      command.execute(
        new GameContext(
          player,
          this.board,
          this.players,
          this.deck,
          this.dice,
        ),
      );
    }
  };

  /**
   * Advances to the next turn and round if necessary.
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
   * Checks if the current player collides with other players on the same square.
   * Returns a Battle object if collision occurs, null otherwise.
   */
  private checkForCollision = (currentPlayer: Player): Battle | null => {
    const position = this.getPlayerPosition(currentPlayer);
    const playersOnSquare = this.board.getPlayersOnSquare(position);
    
    if (playersOnSquare.length > 1) {
      // Find the other player (not the current one)
      const otherPlayer = playersOnSquare.find(p => p !== currentPlayer);
      if (otherPlayer) {
        return new Battle(currentPlayer, otherPlayer);
      }
    }
    return null;
  };

  /**
   * Resolves a battle by moving the winner forward one position.
   * Returns a new Battle object if another collision occurs, null otherwise.
   */
  resolveBattle = (battle: Battle, winner: Player): Battle | null => {
    // Validate that the winner is part of the battle
    battle.resolveBattle(winner);
    
    // Move winner forward one position
    const currentPos = this.getPlayerPosition(winner);
    this.movePlayer(currentPos + 1, winner);
    
    // Check for new collision recursively
    const newCollision = this.checkForCollision(winner);
    if (newCollision) {
      // Another battle needed
      return newCollision;
    }
    
    // Process special square effects on new position
    this.processSpecialSquareEffects(winner);
    
    return null;
  };
}
