import { STORAGE_STATE_KEY_GAME_INSTANCE } from "@/app/vars";
import { Board } from "@/model/board";
import { Game } from "@/model/game";
import { Player } from "@/model/player";
import { QuizSquare } from "@/model/square/quiz-square";
import { expect, test } from "./fixtures";

test.beforeEach(async ({ page }) => {
  const squares = Array.from({ length: 10 }, (_, i) => new QuizSquare(i));
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

test("Quiz only board - basic functionality", async ({ gamePage }) => {
  await gamePage.goto();
  await expect(gamePage.page.getByText("QUIZ")).toHaveCount(10);
});

test("Quiz only board - modal appears after dice roll", async ({
  gamePage,
}) => {
  await gamePage.goto();
  await gamePage.playTurnButton.click();
  await gamePage.rollDiceButton.click();
  await expect(gamePage.turnResultModal).toBeVisible();
});
