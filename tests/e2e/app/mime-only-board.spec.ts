import { Board } from "@/model/board";
import { Game } from "@/model/game";
import { Player } from "@/model/player";
import { MimeSquare } from "@/model/square/mime-square";
import { expect, test } from "./fixtures";
import { addZustandInitScript } from "./zustand";

test.beforeEach(async ({ page }) => {
  const squares = Array.from({ length: 10 }, (_, i) => new MimeSquare(i));
  const players = ["Alice", "Bob"].map((name, i) => new Player(i, name));
  const board = new Board(squares, players);
  const game = new Game(board);

  const gameData = game.toJSON();
  await addZustandInitScript(page, gameData);
});

test("Mime only board", async ({ gamePage }) => {
  await gamePage.goto();
  await expect(gamePage.page.getByText("MIMO")).toHaveCount(8);
});

test("Mime only board - Modal appears after dice roll", async ({
  gamePage,
}) => {
  await gamePage.goto();
  await gamePage.playTurnButton.click();
  await gamePage.rollDiceButton.click();
  await expect(gamePage.turnResultModal).toBeVisible();
});

test("Mime only board - Success moves player forward", async ({ gamePage }) => {
  await gamePage.goto();

  await gamePage.playTurnButton.click();
  await gamePage.rollDiceButton.click();

  await expect(gamePage.turnResultModal).toBeVisible();
  const initialPosition = await gamePage.getPositionInModal();

  await gamePage.mimeShowTopicButton.click();
  await gamePage.mimeGuessedButton.click();
  await gamePage.playerSelectDropdown.selectOption("Bob");
  await gamePage.mimeConfirmButton.click();

  const finalPosition = await gamePage.getPlayerPosition(0);

  await expect(gamePage.turnResultModal).not.toBeVisible();
  expect(finalPosition).toBe(initialPosition + 1);
});

test("Mime only board - Failure skips player turn", async ({ gamePage }) => {
  await gamePage.goto();

  await gamePage.playTurnButton.click();
  await gamePage.rollDiceButton.click();

  await expect(gamePage.turnResultModal).toBeVisible();
  const initialPosition = await gamePage.getPositionInModal();
  await gamePage.mimeShowTopicButton.click();

  await gamePage.mimeNotGuessedButton.click();

  const finalPosition = await gamePage.getPlayerPosition(0);
  expect(finalPosition).toBe(initialPosition);
});
