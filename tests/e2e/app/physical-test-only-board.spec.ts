import {
  MODAL_PHYSICAL_TEST,
  MODAL_PHYSICAL_TEST_COMPLETED,
  MODAL_PHYSICAL_TEST_NOT_COMPLETED,
} from "@/app/texts";
import { Board } from "@/model/board";
import { Game } from "@/model/game";
import { Player } from "@/model/player";
import { PhysicalTestSquare } from "@/model/square/physical-test-square";
import { expect, test } from "./fixtures";
import { addZustandInitScript } from "./zustand";

test.beforeEach(async ({ page }) => {
  const squares = Array.from(
    { length: 10 },
    (_, i) => new PhysicalTestSquare(i),
  );
  const players = ["Alice", "Bob"].map((name, i) => new Player(i, name));
  const board = new Board(squares, players);
  const game = new Game(board);

  const gameData = game.toJSON();
  await addZustandInitScript(page, gameData);
});

test("PhysicalTest only board", async ({ gamePage }) => {
  await gamePage.goto();
  await expect(gamePage.page.getByText("FISICO")).toHaveCount(8);
});

test("PhysicalTest only board - Modal appears after dice roll", async ({
  gamePage,
}) => {
  await gamePage.goto();
  await gamePage.playTurnButton.click();
  await gamePage.rollDiceButton.click();
  await expect(gamePage.turnResultModal).toBeVisible();
  await expect(gamePage.page.getByText(MODAL_PHYSICAL_TEST)).toBeVisible();
});

test("PhysicalTest only board - Success moves player forward", async ({
  gamePage,
}) => {
  await gamePage.goto();

  await gamePage.playTurnButton.click();
  await gamePage.rollDiceButton.click();

  await expect(gamePage.turnResultModal).toBeVisible();
  const initialPosition = await gamePage.getPositionInModal();
  await gamePage.page
    .getByRole("button", { name: MODAL_PHYSICAL_TEST_COMPLETED, exact: true })
    .click();
  const finalPosition = await gamePage.getPlayerPosition(0);

  await expect(gamePage.turnResultModal).not.toBeVisible();
  expect(finalPosition).toBe(initialPosition + 1);
});

test("PhysicalTest only board - Failure skips player turn", async ({
  gamePage,
}) => {
  await gamePage.goto();

  await gamePage.playTurnButton.click();
  await gamePage.rollDiceButton.click();

  await expect(gamePage.turnResultModal).toBeVisible();
  const initialPosition = await gamePage.getPositionInModal();
  await gamePage.page
    .getByRole("button", { name: MODAL_PHYSICAL_TEST_NOT_COMPLETED })
    .click();

  const finalPosition = await gamePage.getPlayerPosition(0);
  expect(finalPosition).toBe(initialPosition);
});
