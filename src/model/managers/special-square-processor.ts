import type { Board } from "../board";
import type { Deck } from "../deck";
import type { Dice } from "../dice";
import { GameContext } from "../gameContext";
import type { Player } from "../player";
import { type Mime, MimeSquare, SpecialSquare } from "../square";

/**
 * Gestisce l'elaborazione degli effetti delle caselle speciali.
 * Si occupa di eseguire i comandi associati alle caselle MimeSquare e SpecialSquare.
 */
export class SpecialSquareProcessor {
  /**
   * Crea un nuovo processore delle caselle speciali.
   * @param board - Il tabellone di gioco
   * @param deck - Il mazzo di carte del gioco
   * @param dice - Il dado utilizzato nel gioco
   */
  constructor(
    private board: Board,
    private deck: Deck,
    private dice: Dice,
  ) {}

  /**
   * Elabora gli effetti delle caselle speciali per il giocatore specificato.
   * Verifica se la casella su cui si trova il giocatore è una casella speciale
   * ed esegue il comando associato.
   * @param player - Il giocatore per cui elaborare gli effetti della casella
   * @param allPlayers - Array di tutti i giocatori della partita
   * @returns Un oggetto Mime se il giocatore atterra su una MimeSquare, undefined altrimenti
   */
  processSquareEffects(player: Player, allPlayers: Player[]): Mime | undefined {
    const playerPosition = this.board.getPlayerPosition(player);
    const landingSquare = this.board.getSquares()[playerPosition];

    // Crea il contesto di gioco per l'esecuzione dei comandi
    const gameContext = new GameContext(
      player,
      this.board,
      allPlayers,
      this.deck,
      this.dice,
    );

    // Casella MimeSquare - restituisce un oggetto Mime
    if (landingSquare instanceof MimeSquare) {
      const command = landingSquare.getCommand();
      return command.execute(gameContext);
    }

    // Casella SpecialSquare - esegue il comando senza restituire valori
    if (landingSquare instanceof SpecialSquare) {
      const command = landingSquare.getCommand();
      command.execute(gameContext);
    }

    // Casella normale - nessun effetto speciale
    return undefined;
  }

  /**
   * Verifica se una casella è una casella speciale (MimeSquare o SpecialSquare).
   * @param position - La posizione della casella da controllare
   * @returns True se la casella è speciale, false altrimenti
   */
  isSpecialSquare(position: number): boolean {
    const square = this.board.getSquares()[position];
    return square instanceof MimeSquare || square instanceof SpecialSquare;
  }

  /**
   * Restituisce il tipo di casella speciale alla posizione specificata.
   * @param position - La posizione della casella da controllare
   * @returns Il tipo di casella ('mime', 'special', 'normal')
   */
  getSquareType(position: number): "mime" | "special" | "normal" {
    const square = this.board.getSquares()[position];

    if (square instanceof MimeSquare) {
      return "mime";
    }

    if (square instanceof SpecialSquare) {
      return "special";
    }

    return "normal";
  }
}
