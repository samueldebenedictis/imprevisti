import { Board } from "@/model/board";
import { Game } from "@/model/game";
import { Player } from "@/model/player";
import { MoveSquare } from "@/model/square/move-square";
import { expect, test } from "./fixtures";

test.beforeEach(async ({ page }) => {
  const squares = Array.from({ length: 10 }, (_, i) => {
    const moveValue = i % 2 === 0 ? 2 : -1;
    return new MoveSquare(i, moveValue);
  });
  const players = ["Alice", "Bob"].map((name, i) => new Player(i, name));
  const board = new Board(squares, players);
  const game = new Game(board, players);

  const gameData = game.toJSON();

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
});

test("Movement only board", async ({ gamePage }) => {
  await gamePage.goto();
  await expect(gamePage.page.getByText(/\+|-/)).toHaveCount(10);
});

test("Movement only board - Modal appears after dice roll", async ({
  gamePage,
}) => {
  await gamePage.goto();
  await gamePage.playTurnButton.click();
  await gamePage.rollDiceButton.click();
  await expect(gamePage.turnResultModal).toBeVisible();
});
