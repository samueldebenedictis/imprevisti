import type { BoardT } from "./board";
import { Dice } from "./dice";
import { Player } from "./player";
import { SpecialSquare } from "./square";

export class Game {
  private boardSize: number;
  private board: BoardT;

  private players: Player[];
  private turn: number;
  private round: number;

  private dice: Dice;

  private gameEnded: boolean;
  private winner: Player | undefined;

  constructor(board: BoardT, playersName: string[]) {
    this.boardSize = board.getSquares().length;
    this.board = board;
    this.players = playersName.map((name, i) => new Player(i, name));
    this.round = 1;
    this.turn = 0;
    this.dice = new Dice(6);
    this.gameEnded = false;
  }

  getBoard = () => this.board.getSquares();
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

    actualPlayer.setPosition(landingPosition);
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
      const newPosition = actualPlayer.getPosition() + diceValue;

      this.movePlayer(newPosition, actualPlayer);

      const landingSquare = this.board.getSquares()[actualPlayer.getPosition()];
      if (landingSquare instanceof SpecialSquare) {
        const command = landingSquare.getCommand();
        command.execute(this, actualPlayer);
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
