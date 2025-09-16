import type { Board } from "../board";
import type { Deck } from "../deck";
import type { DictationDraw } from "../deck/dictation-draw";
import type { MusicEmotion } from "../deck/music-emotion";
import type { PhysicalTest } from "../deck/physical-test";
import type { WhatWouldYouDo } from "../deck/what-would-you-do";
import type { Dice } from "../dice";
import type { Player } from "../player";
import {
  type BackWrite,
  BackWriteSquare,
  type CommandDependencies, // Importa CommandDependencies
  type Mime,
  MimeSquare,
  type Quiz,
  QuizSquare,
  SpecialSquare,
} from "../square";
import { DictationDrawSquare } from "../square/dictation-draw-square";
import { MusicEmotionSquare } from "../square/music-emotion-square";
import { PhysicalTestSquare } from "../square/physical-test-square";
import { WhatWouldYouDoSquare } from "../square/what-would-you-do-square";
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
   * @param mimeDeck - Il mazzo di carte per il mimo
   * @param quizDeck - Il mazzo di carte per il quiz
   * @param backWriteDeck - Il mazzo di carte per lo scrivere sulla schiena
   * @param musicEmotionDeck - Il mazzo di carte per la musica emozioni
   * @param physicalTestDeck - Il mazzo di carte per i test fisici
   * @param whatWouldYouDoDeck - Il mazzo di carte per le domande "cosa faresti se"
   * @param dictationDrawDeck - Il mazzo di carte per il disegno dettato
   * @param dice - Il dado del gioco
   * @param movementManager - Manager per gestire i movimenti
   * @param gameStateManager - Manager per gestire lo stato del gioco
   */
  constructor(
    private board: Board,
    private mimeDeck: Deck,
    private quizDeck: Deck,
    private backWriteDeck: Deck,
    private musicEmotionDeck: Deck,
    private physicalTestDeck: Deck,
    private whatWouldYouDoDeck: Deck,
    private dictationDrawDeck: Deck,
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
   * @returns Un oggetto Mime, Quiz, BackWrite, MusicEmotion, PhysicalTest, WhatWouldYouDo o DictationDraw se il giocatore atterra su una casella speciale, undefined altrimenti
   */
  processSquareEffects(
    player: Player,
    allPlayers: Player[],
  ):
    | Mime
    | Quiz
    | BackWrite
    | MusicEmotion
    | PhysicalTest
    | WhatWouldYouDo
    | DictationDraw
    | undefined {
    const playerPosition = this.board.getPlayerPosition(player);
    const landingSquare = this.board.getSquares()[playerPosition];

    // Crea l'oggetto CommandDependencies con tutte le dipendenze necessarie
    const commandDependencies: CommandDependencies = {
      player,
      board: this.board,
      allPlayers,
      mimeDeck: this.mimeDeck,
      quizDeck: this.quizDeck,
      backWriteDeck: this.backWriteDeck,
      musicEmotionDeck: this.musicEmotionDeck,
      physicalTestDeck: this.physicalTestDeck,
      whatWouldYouDoDeck: this.whatWouldYouDoDeck,
      dictationDrawDeck: this.dictationDrawDeck,
      dice: this.dice,
      movementManager: this.movementManager,
      gameStateManager: this.gameStateManager,
    };

    const squareType = this.getSquareType(playerPosition);

    switch (squareType) {
      // Casella MimeSquare - restituisce un oggetto Mime
      case "mime": {
        const command = (landingSquare as MimeSquare).getCommand();
        return command.execute(commandDependencies);
      }
      case "quiz": {
        const command = (landingSquare as QuizSquare).getCommand();
        return command.execute(commandDependencies);
      }
      case "backwrite": {
        const command = (landingSquare as BackWriteSquare).getCommand();
        return command.execute(commandDependencies);
      }
      case "music-emotion": {
        const command = (landingSquare as MusicEmotionSquare).getCommand();
        return command.execute(commandDependencies);
      }
      case "physical-test": {
        const command = (landingSquare as PhysicalTestSquare).getCommand();
        return command.execute(commandDependencies);
      }
      case "what-would-you-do": {
        const command = (landingSquare as WhatWouldYouDoSquare).getCommand();
        return command.execute(commandDependencies);
      }
      case "dictation-draw": {
        const command = (landingSquare as DictationDrawSquare).getCommand();
        return command.execute(commandDependencies);
      }
      // Casella SpecialSquare - esegue il comando senza restituire valori
      case "special": {
        const command = (landingSquare as SpecialSquare).getCommand();
        return command.execute(commandDependencies);
      }
      // Casella normale - nessun effetto speciale
      case "normal": {
        return undefined;
      }
    }
  }

  /**
   * Restituisce il tipo di casella speciale alla posizione specificata.
   * @param position - La posizione della casella da controllare
   * @returns Il tipo di casella ('mime', 'special', 'normal', 'quiz', 'backwrite', 'music-emotion', 'physical-test', 'what-would-you-do', 'dictation-draw')
   */
  getSquareType(
    position: number,
  ):
    | "mime"
    | "special"
    | "normal"
    | "quiz"
    | "backwrite"
    | "music-emotion"
    | "physical-test"
    | "what-would-you-do"
    | "dictation-draw" {
    const square = this.board.getSquares()[position];

    if (square instanceof MimeSquare) {
      return "mime";
    }

    if (square instanceof QuizSquare) {
      return "quiz";
    }

    if (square instanceof BackWriteSquare) {
      return "backwrite";
    }

    if (square instanceof MusicEmotionSquare) {
      return "music-emotion";
    }

    if (square instanceof PhysicalTestSquare) {
      return "physical-test";
    }

    if (square instanceof WhatWouldYouDoSquare) {
      return "what-would-you-do";
    }

    if (square instanceof DictationDrawSquare) {
      return "dictation-draw";
    }

    if (square instanceof SpecialSquare) {
      return "special";
    }

    return "normal";
  }
}
