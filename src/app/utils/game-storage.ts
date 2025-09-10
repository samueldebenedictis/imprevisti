import type { GameJSON } from "@/model/game";
import { STORAGE_STATE_KEY_GAME_INSTANCE } from "../../vars";

/**
 * Salva l'istanza di gioco corrente come file JSON scaricabile.
 * Crea un blob con i dati di gioco e attiva il download nel browser.
 *
 * @param gameInstance - L'istanza di gioco da salvare
 */
export function saveGame(gameInstance: GameJSON): void {
  const gameJSON = JSON.stringify(gameInstance, null, 2);
  const blob = new Blob([gameJSON], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "salvataggio.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Carica un'istanza di gioco da una stringa JSON.
 * Analizza la stringa JSON e restituisce i dati di gioco se validi.
 *
 * @param jsonString - La stringa JSON contenente i dati di gioco
 * @returns L'istanza di gioco analizzata o null se l'analisi fallisce
 */
export function loadGame(jsonString: string): GameJSON | null {
  if (jsonString) {
    return JSON.parse(jsonString) as GameJSON;
  }
  return null;
}

/**
 * Carica l'ultima istanza di gioco salvata da localStorage.
 * Recupera i dati di gioco memorizzati nella memoria locale del browser.
 *
 * @returns L'istanza di gioco salvata o null se nessun gioco è salvato
 */
export function loadGameFromLocalStorage(): GameJSON | null {
  const savedGame = localStorage.getItem(STORAGE_STATE_KEY_GAME_INSTANCE);
  if (savedGame) {
    return JSON.parse(savedGame) as GameJSON;
  }
  return null;
}
