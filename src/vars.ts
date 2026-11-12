export const URL_HOME = "/";
export const URL_GAME = "/game";
export const URL_MULTIPLAYER = "/multiplayer";
export const URL_INSTRUCTION = "/instructions";
export const URL_RESTORE_GAME = "/restore-game";
export const URL_FEEDBACK = "/feedback";
export const URL_ADVANCED_MODE = "/advanced-mode";

export const MIN_PLAYERS: number = 2;
export const MAX_PLAYERS: number = 10;
export const DEFAULT_PLAYERS: number = 2;
export const MIN_SQUARES: number = 10;
export const MAX_SQUARES: number = 100;
export const DEFAULT_SQUARES: number = 30;
export const DEFAULT_SPECIAL_PERCENTAGE_SQUARES: number = 20;

export const SAVEFILE = "save.json";

// Casella "Film" disattivata: mancano i diritti sulle scene dei film.
// Rimettere a true dopo aver reinserito i video in public/videos.
export const FILM_ENABLED: boolean = false;

// Casella "Indovina l'emozione" disattivata: le fotografie FACES non sono più
// nei file pubblici e verranno servite da un archivio privato (in attesa
// della conferma del FACES Technical Agent). Rimettere a true quando il
// Route Handler che le serve è pronto.
export const FACE_EMOTION_ENABLED: boolean = true;
