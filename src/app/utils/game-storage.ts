import type { GameJSON } from "@/model/game";
import { STORAGE_STATE_KEY_GAME_INSTANCE } from "../vars";

export function saveGame(gameInstance: GameJSON) {
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

export function loadGame(jsonString: string): GameJSON | null {
  if (jsonString) {
    return JSON.parse(jsonString) as GameJSON;
  }
  return null;
}

export function loadGameFromLocalStorage(): GameJSON | null {
  const savedGame = localStorage.getItem(STORAGE_STATE_KEY_GAME_INSTANCE);
  if (savedGame) {
    return JSON.parse(savedGame) as GameJSON;
  }
  return null;
}
