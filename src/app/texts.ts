// Testi e label

// Homepage
export const LABEL_PLAYERS_NUMBER = "Numero di giocatori:";
export const LABEL_PLAYER_NAME = (n: number) => `Nome giocatore ${n}:`;
export const LABEL_SQUARES_NUMBER = "Numero di caselle:";
export const LABEL_GAME_CONFIGURATION = "Configurazione gioco";
export const LABEL_SPECIAL_SQUARES = "Caselle speciali";
export const LABEL_SPECIAL_PERCENTAGE = (n: number) =>
  `Percentuale di caselle speciali: ${n}%`;
export const LABEL_MIME = "Caselle mimo";
export const LABEL_QUIZ = "Caselle quiz";
export const LABEL_MOVE = "Caselle movimento";
export const LABEL_SUBMIT = "Inizia gioco";

// Dice Result Modal
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
export const MODAL_CLOSE_BUTTON = "Chiudi";

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

// Turn Result Modal
export const MODAL_SPECIAL_EFFECT = "Effetto Speciale!";
export const MODAL_SPECIAL_SQUARE_MESSAGE =
  "Sei atterrato su una casella speciale! Ti muovi ";
export const MODAL_MOVE_FORWARD = "avanti di ";
export const MODAL_MOVE_BACKWARD = "indietro di ";
export const MODAL_TOTAL_MOVEMENT = "Movimento totale:";
export const MODAL_NEW_POSITION = "Nuova posizione:";
