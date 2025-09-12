import { Board } from "@/model/board";
import { Game } from "@/model/game";
import { Player } from "@/model/player";
import { DrawSquare } from "@/model/square/draw-square";
import { expect, test } from "./fixtures";
import { addZustandInitScript } from "./zustand";

test.beforeEach(async ({ page }) => {
  const squares = Array.from({ length: 10 }, (_, i) => new DrawSquare(i));
  const players = ["Alice", "Bob"].map((name, i) => new Player(i, name));
  const board = new Board(squares, players);
  const game = new Game(board);

  const gameData = game.toJSON();
  await addZustandInitScript(page, gameData);
});

test("Draw only board", async ({ gamePage }) => {
  await gamePage.goto();
  await expect(gamePage.page.getByText("DISEGNO")).toHaveCount(8);
});

test("Draw only board - Modal appears after dice roll", async ({
  gamePage,
}) => {
  await gamePage.goto();
  await gamePage.playTurnButton.click();
  await gamePage.rollDiceButton.click();
  await expect(gamePage.turnResultModal).toBeVisible();
});
