import type { Page } from "@playwright/test";
import type { GameJSON } from "@/model/game";

export async function addZustandInitScript(page: Page, gameData: GameJSON) {
  await page.addInitScript(
    ([gameData]) => {
      const zustandData = {
        state: {
          game: null,
          gameData: gameData,
          counter: 0,
          isModalOpen: false,
          isDiceModalOpen: false,
          isRolling: false,
          diceResult: null,
          modalDiceResult: null,
          actionType: null,
          actionData: null,
          playerWhoRolledName: null,
          playerWhoRolled: null,
          startPosition: undefined,
          newPosition: undefined,
          hasSavedGame: true,
          selectedFile: null,
        },
        version: 0,
      };
      localStorage.setItem("game-store", JSON.stringify(zustandData));
    },
    [gameData],
  );
}
