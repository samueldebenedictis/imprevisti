export const URL_HOME = "/";
export const URL_GAME = "/game";
export const URL_MULTIPLAYER = "/multiplayer";
export const URL_INSTRUCTION = "/instructions";
export const URL_RESTORE_GAME = "/restore-game";
export const URL_FEEDBACK = "/feedback";
export const URL_ADVANCED_MODE = "/advanced-mode";
export const URL_CUSTOM_DECKS = "/custom-decks";

export const MIN_PLAYERS: number = 2;
export const MAX_PLAYERS: number = 10;
export const DEFAULT_PLAYERS: number = 2;
export const MIN_SQUARES: number = 10;
export const MAX_SQUARES: number = 100;
export const DEFAULT_SQUARES: number = 30;
export const DEFAULT_SPECIAL_PERCENTAGE_SQUARES: number = 20;

export const SAVEFILE = "save.json";

// Casella "Emozioni in movimento": clip Dynamic FACES (con il codice
// dell'educatore). Senza codice le caselle diventano "Indovina l'emozione".
export const EMOTION_VIDEO_ENABLED: boolean = true;

// Casella "Indovina l'emozione": fotografie FACES servite da un archivio
// privato, visibili solo con il codice dell'educatore e dopo l'accettazione
// del disclaimer; senza codice si usano volti generati.
export const FACE_EMOTION_ENABLED: boolean = true;
