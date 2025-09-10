import type { GameJSON } from "@/model/game";
import { SAVEFILE } from "@/vars";

/**
 * Salva l'istanza di gioco corrente come file JSON.
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
  a.download = SAVEFILE;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
