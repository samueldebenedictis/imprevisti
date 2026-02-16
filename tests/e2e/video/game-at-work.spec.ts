import { Board } from "@/model/board";
import { Game } from "@/model/game";
import { Player } from "@/model/player";
import { Square } from "@/model/square";
import { expect, test } from "../app/fixtures";
import { GamePage } from "../app/pages/game-page";
import { HomePage } from "../app/pages/home-page";
import { addZustandInitScript } from "../app/zustand";

const TIMEOUT = 1000;

test("poster", async ({ page }) => {
  await page.goto("/tesi");
  const homePage = new HomePage(page);
  await homePage.page.waitForTimeout(TIMEOUT);

  await expect(homePage.page).toHaveScreenshot("poster.png");
});

test("setup", async ({ page }) => {
  await page.goto("/tesi");
  const homePage = new HomePage(page);

  await homePage.page.waitForTimeout(TIMEOUT);
  await homePage.playersNumber.clear();
  await homePage.playersNumber.pressSequentially("3");
  await homePage.page.waitForTimeout(TIMEOUT);
  await homePage.playerName(1).pressSequentially("Qui");
  await homePage.page.waitForTimeout(TIMEOUT);
  await homePage.playerName(2).pressSequentially("Quo");
  await homePage.page.waitForTimeout(TIMEOUT);
  await homePage.playerName(3).pressSequentially("Qua");
  await homePage.page.waitForTimeout(TIMEOUT);
  await homePage.squaresNumber.clear();
  await homePage.squaresNumber.pressSequentially("25");
  await homePage.page.waitForTimeout(TIMEOUT);

  await homePage.mimeCheckbox.uncheck();
  await homePage.quizCheckbox.uncheck();
  await homePage.moveCheckbox.uncheck();
  await homePage.backwriteCheckbox.uncheck();
  await homePage.musicEmotionCheckbox.uncheck();
  await homePage.physicalTestCheckbox.uncheck();
  await homePage.whatWouldYouDoCheckbox.uncheck();
  await homePage.dictationDrawCheckbox.uncheck();
  await homePage.faceEmotionsCheckbox.uncheck();
  await homePage.page.waitForTimeout(TIMEOUT);

  await homePage.submit.click();
  await homePage.page.waitForTimeout(TIMEOUT);

  await expect(homePage.page).toHaveURL(/game/);
  await homePage.page.waitForTimeout(TIMEOUT);
});

test("setup with special squares", async ({ page }) => {
  await page.goto("/tesi");
  const homePage = new HomePage(page);

  await homePage.page.waitForTimeout(TIMEOUT);
  await homePage.playersNumber.clear();
  await homePage.playersNumber.pressSequentially("3");
  await homePage.page.waitForTimeout(TIMEOUT);
  await homePage.playerName(1).pressSequentially("Qui");
  await homePage.page.waitForTimeout(TIMEOUT);
  await homePage.playerName(2).pressSequentially("Quo");
  await homePage.page.waitForTimeout(TIMEOUT);
  await homePage.playerName(3).pressSequentially("Qua");
  await homePage.page.waitForTimeout(TIMEOUT);
  await homePage.squaresNumber.clear();
  await homePage.squaresNumber.pressSequentially("25");
  await homePage.page.waitForTimeout(TIMEOUT);

  await homePage.submit.click();
  await homePage.page.waitForTimeout(TIMEOUT);

  await expect(homePage.page).toHaveURL(/game/);
  await homePage.page.waitForTimeout(TIMEOUT);
});

test("end game", async ({ page }) => {
  const squares = Array.from({ length: 10 }, (_, i) => new Square(i));
  const players = ["Alice", "Bob"].map((name, i) => new Player(i, name));
  const board = new Board(squares, players);
  const game = new Game(board);

  const gameData = game.toJSON();
  gameData.board.playersPosition[0].position = 8;
  gameData.board.playersPosition[1].position = 8;

  const gamePage = new GamePage(page);
  await addZustandInitScript(gamePage.page, gameData);
  await page.goto("/tesi/game");
  await gamePage.page.waitForTimeout(2 * TIMEOUT);

  await gamePage.playTurnButton.click();
  await gamePage.page.waitForTimeout(TIMEOUT);

  await gamePage.rollDiceButton.waitFor();

  await gamePage.rollDiceButton.click();
  await gamePage.page.waitForTimeout(TIMEOUT);

  expect(await gamePage.getWinner()).toMatch(/Alice|Bob/);
  await expect(gamePage.playTurnButton).toBeHidden();

  await gamePage.page.waitForTimeout(TIMEOUT);

  await gamePage.continueButton.click();
  await gamePage.page.waitForTimeout(TIMEOUT);
});

test("play turn", async ({ page }) => {
  const squares = Array.from({ length: 30 }, (_, i) => new Square(i));
  const players = ["Alice", "Bob"].map((name, i) => new Player(i, name));
  const board = new Board(squares, players);
  const game = new Game(board);

  const gameData = game.toJSON();
  gameData.board.playersPosition[0].position = 8;
  gameData.board.playersPosition[1].position = 1;

  const gamePage = new GamePage(page);
  await addZustandInitScript(gamePage.page, gameData);
  await page.goto("/tesi/game");
  await gamePage.page.waitForTimeout(2 * TIMEOUT);

  await gamePage.playTurnButton.click();
  await gamePage.page.waitForTimeout(TIMEOUT);

  await gamePage.rollDiceButton.waitFor();

  await gamePage.rollDiceButton.click();
  await gamePage.page.waitForTimeout(TIMEOUT);

  await gamePage.continueButton.waitFor();
  await gamePage.page.waitForTimeout(TIMEOUT);
  await gamePage.continueButton.click();
  await gamePage.page.waitForTimeout(TIMEOUT);
});
