// Testi e label

// Homepage
export const LABEL_PLAYERS_NUMBER = "Numero di giocatori:";
export const LABEL_PLAYER_NAME = (n: number) => `Nome giocatore ${n}:`;
export const LABEL_SQUARES_NUMBER = "Numero di caselle:";
export const LABEL_GAME_CONFIGURATION = "Configurazione gioco";
export const LABEL_SPECIAL_SQUARES = "Caselle speciali";
export const LABEL_SPECIAL_PERCENTAGE = (n: number) =>
  `Percentuale di caselle speciali: ${n}%`;
export const LABEL_MIME = "Mimo";
export const LABEL_QUIZ = "Quiz";
export const LABEL_BACKWRITE = "Parole sulla schiena";
export const LABEL_MOVE = "Avanti e indietro";
export const LABEL_MUSIC_EMOTION = "Emozioni in musica";
export const LABEL_PHYSICAL_TEST = "Test fisici";
export const LABEL_WHAT_WOULD_YOU_DO = "Cosa faresti se...";
export const LABEL_DICTATION_DRAW = "Disegno dettato";
export const LABEL_SUBMIT = "Inizia gioco";

// Turn Result Modal Constants
export const MODAL_TITLE_TURN_RESULT = "Risultato del Turno";
export const MODAL_DICE_ROLL_MESSAGE = " ha tirato un ";
export const MODAL_BATTLE_TITLE = "Battaglia!";
export const MODAL_BATTLE_WINNER_SELECTION = "Seleziona il vincitore";
export const MODAL_QUIZ_TITLE = "Quiz!";
export const MODAL_QUIZ_QUESTION = "Domanda:";
export const MODAL_QUIZ_SHOW_ANSWER = "Mostra Risposta";
export const MODAL_QUIZ_ANSWER = "Risposta:";
export const MODAL_QUIZ_CORRECT = "Corretto";
export const MODAL_QUIZ_WRONG = "Sbagliato";
export const MODAL_MIME_TITLE = "Mimo!";
export const MODAL_MIME_SHOW_TOPIC = "Mostra Mimo";
export const MODAL_MIME_HIDE_TOPIC = "Nascondi Mimo";
export const MODAL_MIME_TOPIC = "Devi mimare:";
export const MODAL_MIME_GUESSED = "Indovinato";
export const MODAL_MIME_NOT_GUESSED = "Non Indovinato";
export const MODAL_MIME_WHO_GUESSED = "Chi ha indovinato?";
export const MODAL_MIME_CONFIRM = "Conferma";
export const MODAL_DICTATION_DRAW_TITLE = "Disegno Dettato!";
export const MODAL_DICTATION_DRAW_SHOW_IMAGE = "Mostra Immagine";
export const MODAL_DICTATION_DRAW_HIDE_IMAGE = "Nascondi Immagine";
export const MODAL_DICTATION_DRAW_TOPIC =
  "Descrivi questa immagine da disegnare:";
export const MODAL_DICTATION_DRAW_DRAWN = "Disegnato bene";
export const MODAL_DICTATION_DRAW_NOT_DRAWN = "Disegnato male";
export const MODAL_DICTATION_DRAW_WHO_DREW = "Chi l'ha disegnato?";
export const MODAL_DICTATION_DRAW_CONFIRM = "Conferma";
export const MODAL_CLOSE_BUTTON = "Chiudi";
export const MODAL_MUSIC_EMOTION_TITLE = "Emozioni in musica!";
export const MODAL_MUSIC_EMOTION_EMOTION_TO_EXPRESS =
  "Emozione da esprimere con una canzone:";
export const MODAL_MUSIC_EMOTION_GUESSED = "Convincente";
export const MODAL_MUSIC_EMOTION_NOT_GUESSED = "Non convincente";
export const MODAL_PHYSICAL_TEST = "Test Fisico!";
export const MODAL_PHYSICAL_TEST_TEST_TO_EXECUTE = "Test da eseguire:";
export const MODAL_PHYSICAL_TEST_COMPLETED = "Completato";
export const MODAL_PHYSICAL_TEST_NOT_COMPLETED = "Non completato";
export const MODAL_WHAT_WOULD_YOU_DO_TITLE = "Cosa Faresti Se...";
export const MODAL_WHAT_WOULD_YOU_DO_QUESTION = "Domanda:";
export const MODAL_WHAT_WOULD_YOU_DO_CONVINCING_ANSWER = "Convincente";
export const MODAL_WHAT_WOULD_YOU_DO_NOT_CONVINCING_ANSWER = "Non convincente";
export const MODAL_BACKWRITE_TITLE = "Scrittura sulla schiena";
export const MODAL_BACKWRITE_SHOW_WORD = "Mostra parola da scrivere";
export const MODAL_BACKWRITE_WORD_TO_WRITE = "Parola da scrivere:";
export const MODAL_BACKWRITE_HIDE_WORD = "Nascondi parola";
export const MODAL_BACKWRITE_GUESSED = "Indovinato";
export const MODAL_BACKWRITE_NOT_GUESSED = "Non indovinato";
export const MODAL_BACKWRITE_WHO_GUESSED = "Chi ha aiutato ad indovinare?";
export const MODAL_BACKWRITE_CONFIRM = "Conferma";
export const MODAL_SPECIAL_EFFECT = "Effetto Speciale!";
export const MODAL_SPECIAL_SQUARE_MESSAGE = "Casella speciale! Ti muovi ";
export const MODAL_MOVE_FORWARD = "avanti di ";
export const MODAL_MOVE_BACKWARD = "indietro di ";
export const MODAL_TOTAL_MOVEMENT = "Movimento totale:";
export const MODAL_NEW_POSITION = "Nuova posizione:";

// Game Save and Restore
export const LABEL_SAVE_GAME_BUTTON = "Salva partita";
export const LABEL_RESTORE_GAME_BUTTON = "Carica partita";
export const LABEL_DELETE_GAME_BUTTON = "Elimina partita";

export const LABEL_RESTORE_GAME_TITLE = "Carica partita";
export const LABEL_CONTINUE_GAME_BUTTON = "Continua partita attuale";
export const LABEL_UPLOAD_FILE = "Carica un file di salvataggio:";
export const LABEL_CONTINUE_GAME_TITLE =
  "Oppure riprendi dall'ultima partita salvata localmente:";
export const LABEL_NO_SAVE_NO_STORAGE =
  "Nessuna partita salvata localmente e nessun file selezionato.";

// Dice Roll Display
export const DICE_BUTTON_CONTINUE = "Continua";
export const DICE_BUTTON_ROLLING = "Lanciando...";
export const DICE_BUTTON_ROLL = "Lancia il dado";
export const DICE_BUTTON_SKIP_TURN = "Salta il turno";
export const DICE_SKIP_TURN_MESSAGE = (playerName: string) =>
  `${playerName} ha saltato il turno!`;

// Left Bar
export const LEFT_BAR_GAME_SAVED = "Gioco salvato!";
export const LEFT_BAR_GAME_STATUS = "Stato del gioco";
export const LEFT_BAR_PLAY_TURN = "Gioca un turno";
export const LEFT_BAR_WINNER = (winnerName: string) =>
  `Vincitore: ${winnerName}!`;
export const LEFT_BAR_CURRENT_TURN = "Turno di:";
export const LEFT_BAR_PLAYERS_POSITION = "Posizione dei giocatori";

// Square
export const SQUARE_START = "START";
export const SQUARE_WIN = "WIN!";
export const SQUARE_MOVE_FORWARD = " AVANTI +";
export const SQUARE_MOVE_BACKWARD = "INDIETRO ";
export const SQUARE_QUIZ = "QUIZ";
export const SQUARE_MIME = "MIMO";
export const SQUARE_DICTATION_DRAW = "DISEGNO";
export const SQUARE_BACKWRITE = "SCHIENA";
export const SQUARE_MUSIC_EMOTION = "MUSICA";
export const SQUARE_PHYSICAL_TEST = "FISICO";
export const SQUARE_WHAT_WOULD_YOU_DO = "DOMANDA";

// Homepage additional
export const LABEL_NO_GAME_FOUND = "Nessuna partita trovata.";
export const LABEL_BACK_TO_HOME = "Torna alla Home";

// Restore game additional
export const LABEL_SELECT_FILE_PLEASE = "Per favore, seleziona un file.";
export const LABEL_INVALID_FILE = "File non valido.";
export const LABEL_LOAD_AND_RESUME = "Carica e riprendi";
export const LABEL_SELECT_FILE = "Seleziona un file...";
export const LABEL_UPLOAD_SAVE_FILE = "Carica un file di salvataggio:";
export const LABEL_RESUME_LAST_LOCAL_SAVE =
  "Oppure riprendi dall'ultima partita salvata localmente:";
export const LABEL_NO_LOCAL_SAVE_NO_FILE =
  "Nessuna partita salvata localmente e nessun file selezionato.";
export const LABEL_SELECT_PLAYER = "Seleziona un giocatore";

// Header
export const LABEL_MENU = "MENU";
export const LABEL_BACK = "INDIETRO";
export const LABEL_INSTRUCTIONS = "ISTRUZIONI";

// Menu
export const LABEL_AUDIO_SETTINGS = "IMPOSTAZIONI AUDIO";
export const LABEL_SOUNDS_ENABLED = "Suoni attivati";
export const LABEL_SOUNDS_DISABLED = "Suoni disattivati";
export const LABEL_CONTINUE_GAME = "Continua partita";
export const LABEL_NEW_GAME = "Nuova partita";
export const LABEL_LOAD_GAME = "Carica partita";

// Pawn
export const LABEL_OTHER_PLAYERS = "giocatori";
