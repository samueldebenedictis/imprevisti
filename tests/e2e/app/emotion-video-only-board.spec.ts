import { MODAL_SPECIAL_EFFECT_INFO_FILM } from "@/app/texts";
import { Board } from "@/model/board";
import { Game } from "@/model/game";
import { Player } from "@/model/player";
import { FilmSquare } from "@/model/square/film-square";
import { expect, test } from "./fixtures";
import { addZustandInitScript } from "./zustand";

test.beforeEach(async ({ page }) => {
  const squares = Array.from({ length: 10 }, (_, i) => new FilmSquare(i));
  const players = ["Alice", "Bob"].map((name, i) => new Player(i, name));
  const board = new Board(squares, players);
  const game = new Game(board);

  const gameData = game.toJSON();
  await addZustandInitScript(page, gameData);
});

test("Film only board - basic functionality", async ({ gamePage }) => {
  await gamePage.goto();
  await expect(gamePage.page.getByText("FILM")).toHaveCount(8);
});

test("Film only board - modal appears after dice roll", async ({
  gamePage,
}) => {
  await gamePage.goto();
  await gamePage.playTurnButton.click();
  await gamePage.rollDiceButton.click();
  await expect(gamePage.turnResultModal).toBeVisible();
});

test("Film only board - Success moves player forward", async ({ gamePage }) => {
  await gamePage.goto();

  await gamePage.playTurnButton.click();
  await gamePage.rollDiceButton.click();

  await expect(gamePage.turnResultModal).toBeVisible();
  const initialPosition = await gamePage.getPositionInModal();
  await gamePage.filmShowAnswerButton.click();

  await gamePage.filmCorrectButton.click();
  const finalPosition = await gamePage.getPlayerPosition(0);

  await expect(gamePage.turnResultModal).not.toBeVisible();
  expect(finalPosition).toBe(initialPosition + 1);
});

test("Film only board - Failure skips player turn", async ({ gamePage }) => {
  await gamePage.goto();

  await gamePage.playTurnButton.click();
  await gamePage.rollDiceButton.click();

  await expect(gamePage.turnResultModal).toBeVisible();
  const initialPosition = await gamePage.getPositionInModal();

  await gamePage.filmShowAnswerButton.click();
  await gamePage.filmWrongButton.click();

  const finalPosition = await gamePage.getPlayerPosition(0);
  expect(finalPosition).toBe(initialPosition);
});

test("Film only board - Info icon shows tooltip on hover", async ({
  gamePage,
}) => {
  await gamePage.goto();
  await gamePage.playTurnButton.click();
  await gamePage.rollDiceButton.click();

  await expect(gamePage.turnResultModal).toBeVisible();

  await gamePage.specialEffectInfoIcon.hover();
  await expect(
    gamePage.page.getByText(MODAL_SPECIAL_EFFECT_INFO_FILM),
  ).toBeVisible();
});
