import { MODAL_SPECIAL_EFFECT_INFO_MOVE } from "@/app/texts";
import { Board } from "@/model/board";
import { Game } from "@/model/game";
import { Player } from "@/model/player";
import { MoveSquare } from "@/model/square/move-square";
import { expect, test } from "./fixtures";
import { addZustandInitScript } from "./zustand";

test.beforeEach(async ({ page }) => {
  const squares = Array.from({ length: 10 }, (_, i) => {
    const moveValue = i % 2 === 0 ? 2 : -1;
    return new MoveSquare(i, moveValue);
  });
  const players = ["Alice", "Bob"].map((name, i) => new Player(i, name));
  const board = new Board(squares, players);
  const game = new Game(board);

  const gameData = game.toJSON();
  await addZustandInitScript(page, gameData);
});

test("Movement only board", async ({ gamePage }) => {
  await gamePage.goto();
  await expect(gamePage.page.getByText(/\+|-/)).toHaveCount(8);
});

test("Movement only board - Modal appears after dice roll", async ({
  gamePage,
}) => {
  await gamePage.goto();
  await gamePage.playTurnButton.click();
  await gamePage.rollDiceButton.click();
  await expect(gamePage.turnResultModal).toBeVisible();
});

test("Movement only board - Info icon shows tooltip on hover", async ({
  gamePage,
}) => {
  await gamePage.goto();
  await gamePage.playTurnButton.click();
  await gamePage.rollDiceButton.click();

  await expect(gamePage.turnResultModal).toBeVisible();

  await gamePage.specialEffectInfoIcon.hover();
  await expect(
    gamePage.page.getByText(MODAL_SPECIAL_EFFECT_INFO_MOVE),
  ).toBeVisible();
});
