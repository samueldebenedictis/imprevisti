import type { Board } from "../board";
import type { Deck } from "../deck";
import type { Dice } from "../dice";
import { GameContext } from "../gameContext";
import type { Player } from "../player";
import { type Mime, MimeSquare, SpecialSquare } from "../square";
import type { GameStateManager } from "./game-state-manager";
import type { MovementManager } from "./movement-manager";

/**
 * Gestisce l'elaborazione degli effetti delle caselle speciali.
 * Si occupa di eseguire i comandi associati alle caselle MimeSquare e SpecialSquare.
 */
export class SpecialSquareProcessor {
  /**
   * Crea un nuovo processore per le caselle speciali.
   * @param board - Il tabellone di gioco
   * @param deck - Il mazzo di carte
   * @param dice - Il dado del gioco
   * @param movementManager - Manager per gestire i movimenti
   * @param gameStateManager - Manager per gestire lo stato del gioco
   */
  constructor(
    private board: Board,
    private deck: Deck,
    private dice: Dice,
    private movementManager: MovementManager,
    private gameStateManager: GameStateManager,
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
      this.movementManager,
      this.gameStateManager,
    );

    const squareType = this.getSquareType(playerPosition);

    switch (squareType) {
      // Casella MimeSquare - restituisce un oggetto Mime
      case "mime": {
        const command = (landingSquare as MimeSquare).getCommand();
        return command.execute(gameContext);
      }
      // Casella SpecialSquare - esegue il comando senza restituire valori
      case "special": {
        const command = (landingSquare as SpecialSquare).getCommand();
        return command.execute(gameContext);
      }
      // Casella normale - nessun effetto speciale
      case "normal": {
        return undefined;
      }
    }
  }

  // TODO: rimuovere se non utilizzato
  // /**
  //  * Verifica se una casella è una casella speciale (MimeSquare o SpecialSquare).
  //  * @param position - La posizione della casella da controllare
  //  * @returns True se la casella è speciale, false altrimenti
  //  */
  // isSpecialSquare(position: number): boolean {
  //   return this.getSquareType(position) !== "normal";
  // }

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
