import type { Battle } from "./battle";
import { Board, type BoardJSON } from "./board";
import {
  BackWriteDeck,
  type Deck,
  DictationDrawDeck,
  EmotionVideoDeck,
  FaceEmotionDeck,
  MimeDeck,
  MusicEmotionDeck,
  PhysicalTestDeck,
  QuizDeck,
  WhatWouldYouDoDeck,
} from "./deck";
import type { FaceSet } from "./deck/face-emotion";
import { Dice } from "./dice";
import {
  BackWriteManager,
  BattleManager,
  DictationDrawManager,
  EmotionVideoManager,
  FaceEmotionManager,
  type GameActionResult,
  GameStateManager,
  MimeManager,
  MovementManager,
  MusicEmotionManager,
  PhysicalTestManager,
  QuizManager,
  SpecialSquareProcessor,
  TurnManager,
  WhatWouldYouDoManager,
} from "./managers";
import { specialActionToResult } from "./managers/action-result";
import { pawnOrDefault } from "./pawn";
import { Player, type PlayerJSON } from "./player";
import type {
  BackWrite,
  DictationDraw,
  EmotionVideo,
  FaceEmotion,
  Mime,
  MusicEmotion,
  PhysicalTest,
  Quiz,
  WhatWouldYouDo,
} from "./square";

export interface GameJSON {
  board: BoardJSON;
  players: PlayerJSON[];
  currentTurn: number;
  currentRound: number;
  gameEnded: boolean;
  winnerId?: number;
  battlesEnabled: boolean;
  /** Volti di "Indovina l'emozione"; assente nei salvataggi precedenti. */
  faceSet?: FaceSet;
}

/**
 * Classe principale che gestisce la logica del gioco da tavolo.
 * Coordina tutti i componenti del gioco attraverso manager specializzati.
 */
export class Game {
  private board: Board;
  private dice: Dice;
  private battlesEnabled: boolean;
  private faceSet: FaceSet;
  private mimeDeck: Deck;
  private quizDeck: Deck;
  private backWriteDeck: Deck;
  private faceEmotionDeck: Deck;
  private emotionVideoDeck: Deck;
  private musicEmotionDeck: Deck;
  private physicalTestDeck: Deck;
  private whatWouldYouDoDeck: Deck;
  private dictationDrawDeck: Deck;

  // Manager per responsabilità specifiche
  private turnManager: TurnManager;
  private movementManager: MovementManager;
  private gameStateManager: GameStateManager;
  private specialSquareProcessor: SpecialSquareProcessor;
  private battleManager: BattleManager;
  private mimeManager: MimeManager;
  private quizManager: QuizManager;
  private backWriteManager: BackWriteManager;
  private faceEmotionManager: FaceEmotionManager;
  private emotionVideoManager: EmotionVideoManager;
  private musicEmotionManager: MusicEmotionManager;
  private physicalTestManager: PhysicalTestManager;
  private whatWouldYouDoManager: WhatWouldYouDoManager;
  private dictationDrawManager: DictationDrawManager;

  /**
   * Crea una nuova partita con i parametri specificati.
   * @param board - L'istanza del tabellone di gioco
   * @param players - Array delle istanze dei giocatori
   * @param diceFaces - Numero di facce del dado (opzionale, default 6)
   * @param battlesEnabled - Se false, le collisioni tra giocatori non generano battaglie (opzionale, default true)
   * @param faceSet - Volti di "Indovina l'emozione": fotografie FACES, solo per partite con codice d'accesso, o volti illustrati (default)
   */
  constructor(
    board: Board,
    diceFaces = 6,
    battlesEnabled = true,
    faceSet: FaceSet = "ai",
  ) {
    // Inizializzazione componenti base
    this.board = board;
    this.dice = new Dice(diceFaces);
    this.battlesEnabled = battlesEnabled;
    this.faceSet = faceSet;
    this.mimeDeck = new MimeDeck();
    this.quizDeck = new QuizDeck();
    this.backWriteDeck = new BackWriteDeck();
    this.faceEmotionDeck = new FaceEmotionDeck(faceSet);
    this.emotionVideoDeck = new EmotionVideoDeck();
    this.musicEmotionDeck = new MusicEmotionDeck();
    this.physicalTestDeck = new PhysicalTestDeck();
    this.whatWouldYouDoDeck = new WhatWouldYouDoDeck();
    this.dictationDrawDeck = new DictationDrawDeck();

    // Inizializzazione manager
    this.turnManager = new TurnManager(board.getPlayers());
    this.gameStateManager = new GameStateManager(board.getSquares().length);
    this.movementManager = new MovementManager(
      this.board,
      this.gameStateManager,
      this.battlesEnabled,
    );
    this.specialSquareProcessor = new SpecialSquareProcessor(
      this.board,
      this.mimeDeck,
      this.quizDeck,
      this.backWriteDeck,
      this.faceEmotionDeck,
      this.musicEmotionDeck,
      this.physicalTestDeck,
      this.whatWouldYouDoDeck,
      this.dictationDrawDeck,
      this.emotionVideoDeck,
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
    this.backWriteManager = new BackWriteManager(this.movementManager);
    this.faceEmotionManager = new FaceEmotionManager(this.movementManager);
    this.emotionVideoManager = new EmotionVideoManager(this.movementManager);
    this.musicEmotionManager = new MusicEmotionManager(this.movementManager);
    this.physicalTestManager = new PhysicalTestManager(this.movementManager);
    this.whatWouldYouDoManager = new WhatWouldYouDoManager(
      this.movementManager,
    );
    this.dictationDrawManager = new DictationDrawManager(this.movementManager);
  }

  /**
   * Converte l'istanza di Game in un oggetto JSON serializzabile.
   * @returns Un oggetto che rappresenta lo stato del Game in formato JSON.
   */
  toJSON(): GameJSON {
    return {
      board: this.board.toJSON(),
      players: this.turnManager.getPlayers().map((p) => ({
        id: p.getId(),
        name: p.getName(),
        turnsToSkip: p.getTurnsToSkip(), // Usa il getter
        pawn: p.getPawn(),
      })),
      currentTurn: this.turnManager.getCurrentTurn(),
      currentRound: this.turnManager.getCurrentRound(),
      gameEnded: this.gameStateManager.isGameEnded(),
      winnerId: this.gameStateManager.getWinner()?.getId(),
      battlesEnabled: this.battlesEnabled,
      faceSet: this.faceSet,
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
      const player = new Player(p.id, p.name, pawnOrDefault(p.pawn, p.id));
      player.setTurnsToSkip(p.turnsToSkip); // Usa il setter
      return player;
    });

    const board = Board.fromJSON(json.board, players);

    const game = new Game(
      board,
      6,
      json.battlesEnabled ?? true,
      json.faceSet ?? "ai",
    );

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
      game.battlesEnabled,
    );
    game.specialSquareProcessor = new SpecialSquareProcessor(
      game.board,
      game.mimeDeck,
      game.quizDeck,
      game.backWriteDeck,
      game.faceEmotionDeck,
      game.musicEmotionDeck,
      game.physicalTestDeck,
      game.whatWouldYouDoDeck,
      game.dictationDrawDeck,
      game.emotionVideoDeck,
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
    game.backWriteManager = new BackWriteManager(game.movementManager);
    game.faceEmotionManager = new FaceEmotionManager(game.movementManager);
    game.emotionVideoManager = new EmotionVideoManager(game.movementManager);
    game.musicEmotionManager = new MusicEmotionManager(game.movementManager);
    game.physicalTestManager = new PhysicalTestManager(game.movementManager);
    game.whatWouldYouDoManager = new WhatWouldYouDoManager(
      game.movementManager,
    );
    game.dictationDrawManager = new DictationDrawManager(game.movementManager);

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

    return specialActionToResult(specialAction, diceValue);
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

  /**
   * Risolve un'azione di scrittura sulla schiena utilizzando il BackWriteManager.
   * @param backWriteAction - L'oggetto BackWrite da risolvere
   * @param success - True se la scrittura è stata indovinata, false altrimenti
   * @param guessPlayer - Il giocatore che ha indovinato la scrittura (richiesto se success è true)
   * @returns Array con eventuali collisioni risultanti dal movimento dei giocatori
   */
  resolveBackWrite(
    backWriteAction: BackWrite,
    success: boolean,
    guessPlayer?: Player,
  ): [Battle | null, Battle | null] {
    return this.backWriteManager.resolveBackWrite(
      backWriteAction,
      success,
      guessPlayer,
    );
  }

  /**
   * Risolve un'azione di musica emozioni utilizzando il MusicEmotionManager.
   * @param musicEmotionAction - L'oggetto MusicEmotion da risolvere
   * @param success - True se l'emozione è stata indovinata, false altrimenti
   * @returns Un oggetto Battle se si verifica una collisione, null altrimenti
   */
  resolveMusicEmotion(
    musicEmotionAction: MusicEmotion,
    success: boolean,
  ): Battle | null {
    const [collision] = this.musicEmotionManager.resolveMusicEmotion(
      musicEmotionAction,
      success,
    );
    return collision;
  }

  /**
   * Risolve un'azione di test fisico utilizzando il PhysicalTestManager.
   * @param physicalTestAction - L'oggetto PhysicalTest da risolvere
   * @param success - True se il test è stato completato, false altrimenti
   * @returns Un oggetto Battle se si verifica una collisione, null altrimenti
   */
  resolvePhysicalTest(
    physicalTestAction: PhysicalTest,
    success: boolean,
  ): Battle | null {
    const [collision] = this.physicalTestManager.resolvePhysicalTest(
      physicalTestAction,
      success,
    );
    return collision;
  }

  /**
   * Risolve un'azione di domanda "cosa faresti se" utilizzando il WhatWouldYouDoManager.
   * @param whatWouldYouDoAction - L'oggetto WhatWouldYouDo da risolvere
   * @param success - True se la risposta convince, false altrimenti
   * @returns Un oggetto Battle se si verifica una collisione, null altrimenti
   */
  resolveWhatWouldYouDo(
    whatWouldYouDoAction: WhatWouldYouDo,
    success: boolean,
  ): Battle | null {
    const [collision] = this.whatWouldYouDoManager.resolveWhatWouldYouDo(
      whatWouldYouDoAction,
      success,
    );
    return collision;
  }

  /**
   * Risolve un'azione di disegno dettato utilizzando il DictationDrawManager.
   * @param dictationDrawAction - L'oggetto DictationDraw da risolvere
   * @param success - True se il disegno è stato simile, false altrimenti
   * @param drawingPlayer - Il giocatore che ha disegnato (richiesto se success è true)
   * @returns Array con eventuali collisioni risultanti dal movimento dei giocatori
   */
  resolveDictationDraw(
    dictationDrawAction: DictationDraw,
    success: boolean,
    drawingPlayer?: Player,
  ): [Battle | null, Battle | null] {
    return this.dictationDrawManager.resolveDictationDraw(
      dictationDrawAction,
      success,
      drawingPlayer,
    );
  }

  /**
   * Risolve un'azione di emozione facciale utilizzando il FaceEmotionManager.
   * @param faceEmotionAction - L'oggetto FaceEmotion da risolvere
   * @param success - True se l'emozione è stata indovinata, false altrimenti
   * @returns Un oggetto Battle se si verifica una collisione, null altrimenti
   */
  resolveFaceEmotion(
    faceEmotionAction: FaceEmotion,
    success: boolean,
  ): Battle | null {
    return this.faceEmotionManager.resolveFaceEmotion(
      faceEmotionAction,
      success,
    );
  }

  /**
   * Risolve un'azione film utilizzando il EmotionVideoManager.
   * @param emotionVideoAction - L'oggetto EmotionVideo da risolvere
   * @param success - True se l'emozione della scena è stata indovinata, false altrimenti
   * @returns Un oggetto Battle se si verifica una collisione, null altrimenti
   */
  resolveEmotionVideo(
    emotionVideoAction: EmotionVideo,
    success: boolean,
  ): Battle | null {
    return this.emotionVideoManager.resolveEmotionVideo(
      emotionVideoAction,
      success,
    );
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

  /** Volti usati da "Indovina l'emozione" in questa partita. */
  getFaceSet(): FaceSet {
    return this.faceSet;
  }
}
