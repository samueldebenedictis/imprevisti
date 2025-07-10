import { Board, type BoardT } from "./board";
import type { Card } from "./card";
import { Deck } from "./deck";
import { Dice } from "./dice";
import { GameContext } from "./gameContext";
import { Player } from "./player";
import { SpecialSquare, type Square } from "./square/square";

export class Game {
  private boardSize: number;
  private board: BoardT;

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
   */
  playTurn = () => {
    if (!this.gameEnded) {
      const actualPlayer = this.players[this.turn];
      const diceValue = this.dice.roll();
      const newPosition =
        (this.board.getPlayerPosition(actualPlayer) as number) + diceValue;

      this.movePlayer(newPosition, actualPlayer);

      const landingSquare =
        this.board.getSquares()[
          this.board.getPlayerPosition(actualPlayer) as number
        ];
      if (landingSquare instanceof SpecialSquare) {
        const command = landingSquare.getCommand();
        command.execute(
          new GameContext(
            actualPlayer,
            this.board,
            this.players,
            this.deck,
            this.dice,
          ),
        );
      }

      if (this.turn === this.players.length - 1) {
        this.turn = 0;
        this.round++;
      } else {
        this.turn++;
      }
    } else {
      throw new Error("playTurn not avalaible, the game is already ended");
    }
  };
}
