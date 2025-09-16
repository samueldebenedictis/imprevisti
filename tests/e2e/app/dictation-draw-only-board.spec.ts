import {
  MODAL_DICTATION_DRAW_CONFIRM,
  MODAL_DICTATION_DRAW_DRAWN,
  MODAL_DICTATION_DRAW_NOT_DRAWN,
  MODAL_DICTATION_DRAW_SHOW_IMAGE,
  SQUARE_DICTATION_DRAW_TOP,
} from "@/app/texts";
import { Board } from "@/model/board";
import { Game } from "@/model/game";
import { Player } from "@/model/player";
import { DictationDrawSquare } from "@/model/square/dictation-draw-square";
import { expect, test } from "./fixtures";
import { addZustandInitScript } from "./zustand";

test.beforeEach(async ({ page }) => {
  const squares = Array.from(
    { length: 10 },
    (_, i) => new DictationDrawSquare(i),
  );
  const players = ["Alice", "Bob"].map((name, i) => new Player(i, name));
  const board = new Board(squares, players);
  const game = new Game(board);

  const gameData = game.toJSON();
  await addZustandInitScript(page, gameData);
});

test("Dictation draw only board", async ({ gamePage }) => {
  await gamePage.goto();
  await expect(gamePage.page.getByText(SQUARE_DICTATION_DRAW_TOP)).toHaveCount(
    8,
  );
});

test("Dictation draw only board - Modal appears after dice roll", async ({
  gamePage,
}) => {
  await gamePage.goto();
  await gamePage.playTurnButton.click();
  await gamePage.rollDiceButton.click();
  await expect(gamePage.turnResultModal).toBeVisible();
});

test("Dictation draw only board - Success moves both players forward", async ({
  gamePage,
}) => {
  await gamePage.goto();

  await gamePage.playTurnButton.click();
  await gamePage.rollDiceButton.click();

  await expect(gamePage.turnResultModal).toBeVisible();
  const initialPosition = await gamePage.getPositionInModal();

  await gamePage.page
    .getByRole("button", { name: MODAL_DICTATION_DRAW_SHOW_IMAGE })
    .click();
  await gamePage.page
    .getByRole("button", { name: MODAL_DICTATION_DRAW_DRAWN, exact: true })
    .click();
  await gamePage.page.getByRole("combobox").selectOption("Bob");
  await gamePage.page
    .getByRole("button", { name: MODAL_DICTATION_DRAW_CONFIRM, exact: true })
    .click();

  const player1Position = await gamePage.getPlayerPosition(0);
  const player2Position = await gamePage.getPlayerPosition(1);

  await expect(gamePage.turnResultModal).not.toBeVisible();
  expect(player1Position).toBe(initialPosition + 1);
  expect(player2Position).toBe(1); // Bob moves forward from position 0
});

test("Dictation draw only board - Failure skips describing player turn", async ({
  gamePage,
}) => {
  await gamePage.goto();

  await gamePage.playTurnButton.click();
  await gamePage.rollDiceButton.click();

  await expect(gamePage.turnResultModal).toBeVisible();
  const initialPosition = await gamePage.getPositionInModal();
  await gamePage.page
    .getByRole("button", { name: MODAL_DICTATION_DRAW_SHOW_IMAGE })
    .click();

  await gamePage.page
    .getByRole("button", { name: MODAL_DICTATION_DRAW_NOT_DRAWN })
    .click();

  const player1Position = await gamePage.getPlayerPosition(0);
  expect(player1Position).toBe(initialPosition);
});

test("Dictation draw only board - Image is displayed when shown", async ({
  gamePage,
}) => {
  await gamePage.goto();

  await gamePage.playTurnButton.click();
  await gamePage.rollDiceButton.click();

  await expect(gamePage.turnResultModal).toBeVisible();

  await expect(gamePage.page.locator("img")).not.toBeVisible();
  await gamePage.page
    .getByRole("button", { name: MODAL_DICTATION_DRAW_SHOW_IMAGE })
    .click();

  await expect(gamePage.page.locator("img")).toBeVisible();
});
