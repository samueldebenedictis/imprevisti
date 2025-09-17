import { Board } from "@/model/board";
import { Game } from "@/model/game";
import { Player } from "@/model/player";
import { QuizSquare } from "@/model/square/quiz-square";
import { expect, test } from "./fixtures";
import { addZustandInitScript } from "./zustand";

test.beforeEach(async ({ page }) => {
  const squares = Array.from({ length: 10 }, (_, i) => new QuizSquare(i));
  const players = ["Alice", "Bob"].map((name, i) => new Player(i, name));
  const board = new Board(squares, players);
  const game = new Game(board);

  const gameData = game.toJSON();
  await addZustandInitScript(page, gameData);
});

test("Quiz only board - basic functionality", async ({ gamePage }) => {
  await gamePage.goto();
  await expect(gamePage.page.getByText("QUIZ")).toHaveCount(8);
});

test("Quiz only board - modal appears after dice roll", async ({
  gamePage,
}) => {
  await gamePage.goto();
  await gamePage.playTurnButton.click();
  await gamePage.rollDiceButton.click();
  await expect(gamePage.turnResultModal).toBeVisible();
});

test("Quiz only board - Success moves player forward", async ({ gamePage }) => {
  await gamePage.goto();

  await gamePage.playTurnButton.click();
  await gamePage.rollDiceButton.click();

  await expect(gamePage.turnResultModal).toBeVisible();
  const initialPosition = await gamePage.getPositionInModal();
  await gamePage.quizShowAnswerButton.click();

  await gamePage.quizCorrectButton.click();
  const finalPosition = await gamePage.getPlayerPosition(0);

  await expect(gamePage.turnResultModal).not.toBeVisible();
  expect(finalPosition).toBe(initialPosition + 1);
});

test("Quiz only board - Failure skips player turn", async ({ gamePage }) => {
  await gamePage.goto();

  await gamePage.playTurnButton.click();
  await gamePage.rollDiceButton.click();

  await expect(gamePage.turnResultModal).toBeVisible();
  const initialPosition = await gamePage.getPositionInModal();

  await gamePage.quizShowAnswerButton.click();
  await gamePage.quizWrongButton.click();

  const finalPosition = await gamePage.getPlayerPosition(0);
  expect(finalPosition).toBe(initialPosition);
});
