import { STORAGE_STATE_KEY_GAME_INSTANCE } from "@/app/vars";
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

  const gameJSON = JSON.stringify(game.toJSON());
  await page.addInitScript(
    ([gameData, storageKey]) => {
      localStorage.setItem(storageKey, gameData);
    },
    [gameJSON, STORAGE_STATE_KEY_GAME_INSTANCE],
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
