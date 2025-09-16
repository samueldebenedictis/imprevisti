import {
  MODAL_BACKWRITE_CONFIRM,
  MODAL_BACKWRITE_GUESSED,
  MODAL_BACKWRITE_NOT_GUESSED,
  MODAL_BACKWRITE_SHOW_WORD,
  SQUARE_BACKWRITE_TOP,
} from "@/app/texts";
import { Board } from "@/model/board";
import { Game } from "@/model/game";
import { Player } from "@/model/player";
import { BackWriteSquare } from "@/model/square/backwrite-square";
import { expect, test } from "./fixtures";
import { addZustandInitScript } from "./zustand";

test.beforeEach(async ({ page }) => {
  const squares = Array.from({ length: 10 }, (_, i) => new BackWriteSquare(i));
  const players = ["Alice", "Bob"].map((name, i) => new Player(i, name));
  const board = new Board(squares, players);
  const game = new Game(board);

  const gameData = game.toJSON();
  await addZustandInitScript(page, gameData);
});

test("BackWrite only board", async ({ gamePage }) => {
  await gamePage.goto();
  await expect(gamePage.page.getByText(SQUARE_BACKWRITE_TOP)).toHaveCount(8);
});

test("BackWrite only board - Modal appears after dice roll", async ({
  gamePage,
}) => {
  await gamePage.goto();
  await gamePage.playTurnButton.click();
  await gamePage.rollDiceButton.click();
  await expect(gamePage.turnResultModal).toBeVisible();
});

test("BackWrite only board - Success moves player forward", async ({
  gamePage,
}) => {
  await gamePage.goto();

  await gamePage.playTurnButton.click();
  await gamePage.rollDiceButton.click();

  await expect(gamePage.turnResultModal).toBeVisible();
  const initialPosition = await gamePage.getPositionInModal();

  await gamePage.page
    .getByRole("button", { name: MODAL_BACKWRITE_SHOW_WORD })
    .click();
  await gamePage.page
    .getByRole("button", { name: MODAL_BACKWRITE_GUESSED, exact: true })
    .click();
  await gamePage.page.getByRole("combobox").selectOption("Bob");
  await gamePage.page
    .getByRole("button", { name: MODAL_BACKWRITE_CONFIRM, exact: true })
    .click();

  const finalPosition = await gamePage.getPlayerPosition(0);

  await expect(gamePage.turnResultModal).not.toBeVisible();
  expect(finalPosition).toBe(initialPosition + 1);
});

test("BackWrite only board - Failure skips player turn", async ({
  gamePage,
}) => {
  await gamePage.goto();

  await gamePage.playTurnButton.click();
  await gamePage.rollDiceButton.click();

  await expect(gamePage.turnResultModal).toBeVisible();
  const initialPosition = await gamePage.getPositionInModal();

  await gamePage.page
    .getByRole("button", { name: MODAL_BACKWRITE_SHOW_WORD })
    .click();
  await gamePage.page
    .getByRole("button", { name: MODAL_BACKWRITE_NOT_GUESSED })
    .click();

  const finalPosition = await gamePage.getPlayerPosition(0);
  expect(finalPosition).toBe(initialPosition);
});
