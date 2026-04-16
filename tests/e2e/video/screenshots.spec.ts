import { Board } from "@/model/board";
import { Game } from "@/model/game";
import { Player } from "@/model/player";
import { Square } from "@/model/square";
import { BackWriteSquare } from "@/model/square/backwrite-square";
import { DictationDrawSquare } from "@/model/square/dictation-draw-square";
import { FaceEmotionSquare } from "@/model/square/face-emotion-square";
import { MimeSquare } from "@/model/square/mime-square";
import { MusicEmotionSquare } from "@/model/square/music-emotion-square";
import { PhysicalTestSquare } from "@/model/square/physical-test-square";
import { QuizSquare } from "@/model/square/quiz-square";
import { WhatWouldYouDoSquare } from "@/model/square/what-would-you-do-square";
import { expect, test } from "../app/fixtures";
import { GamePage } from "../app/pages/game-page";
import { HomePage } from "../app/pages/home-page";
import { addZustandInitScript } from "../app/zustand";

const VIEWPORT = { width: 1920, height: 1080 };

test("screenshot-home", async ({ page }) => {
  await page.setViewportSize(VIEWPORT);
  await page.goto("/tesi");

  await expect(page).toHaveScreenshot("home.png");
});

test("screenshot-home-filled", async ({ page }) => {
  await page.setViewportSize(VIEWPORT);
  await page.goto("/tesi");
  const homePage = new HomePage(page);

  await homePage.playersNumber.clear();
  await homePage.playersNumber.pressSequentially("3");
  await homePage.playerName(1).pressSequentially("Alice");
  await homePage.playerName(2).pressSequentially("Bob");
  await homePage.playerName(3).pressSequentially("Carol");
  await homePage.squaresNumber.clear();
  await homePage.squaresNumber.pressSequentially("20");

  await expect(page).toHaveScreenshot("home-filled.png");
});

test("screenshot-advanced-mode", async ({ page }) => {
  await page.setViewportSize(VIEWPORT);
  await page.goto("/tesi");
  const homePage = new HomePage(page);

  await homePage.advancedModeButton.click();

  await expect(page).toHaveScreenshot("advanced-mode.png");
});

test("screenshot-game-board", async ({ page }) => {
  await page.setViewportSize(VIEWPORT);
  const squares = Array.from({ length: 25 }, (_, i) => new Square(i));
  const players = ["Alice", "Bob", "Carol"].map(
    (name, i) => new Player(i, name),
  );
  const board = new Board(squares, players);
  const game = new Game(board);

  const gameData = game.toJSON();
  gameData.board.playersPosition[0].position = 5;
  gameData.board.playersPosition[1].position = 3;
  gameData.board.playersPosition[2].position = 7;

  const gamePage = new GamePage(page);
  await addZustandInitScript(gamePage.page, gameData);
  await page.goto("/tesi/game");

  await expect(page).toHaveScreenshot("game-board.png");
});

test("screenshot-dice-roll", async ({ page }) => {
  await page.setViewportSize(VIEWPORT);
  const squares = Array.from({ length: 25 }, (_, i) => new Square(i));
  const players = ["Alice", "Bob"].map((name, i) => new Player(i, name));
  const board = new Board(squares, players);
  const game = new Game(board);

  const gameData = game.toJSON();
  gameData.board.playersPosition[0].position = 3;
  gameData.board.playersPosition[1].position = 1;

  const gamePage = new GamePage(page);
  await addZustandInitScript(gamePage.page, gameData);
  await page.goto("/tesi/game");

  await gamePage.playTurnButton.click();
  await gamePage.rollDiceButton.waitFor();

  await expect(page).toHaveScreenshot("dice-roll.png");
});

test("screenshot-quiz-modal", async ({ page }) => {
  await page.setViewportSize(VIEWPORT);
  const squares = Array.from({ length: 10 }, (_, i) => new QuizSquare(i));
  const players = ["Alice", "Bob"].map((name, i) => new Player(i, name));
  const board = new Board(squares, players);
  const game = new Game(board);

  const gamePage = new GamePage(page);
  await addZustandInitScript(gamePage.page, game.toJSON());
  await page.goto("/tesi/game");

  await gamePage.playTurnButton.click();
  await gamePage.rollDiceButton.click();

  await expect(gamePage.turnResultFullModal).toBeVisible();
  await expect(gamePage.turnResultFullModal).toHaveScreenshot("quiz-modal.png");
});

test("screenshot-quiz-modal-answer", async ({ page }) => {
  await page.setViewportSize(VIEWPORT);
  const squares = Array.from({ length: 10 }, (_, i) => new QuizSquare(i));
  const players = ["Alice", "Bob"].map((name, i) => new Player(i, name));
  const board = new Board(squares, players);
  const game = new Game(board);

  const gamePage = new GamePage(page);
  await addZustandInitScript(gamePage.page, game.toJSON());
  await page.goto("/tesi/game");

  await gamePage.playTurnButton.click();
  await gamePage.rollDiceButton.click();

  await expect(gamePage.turnResultFullModal).toBeVisible();
  await gamePage.quizShowAnswerButton.click();

  await expect(gamePage.turnResultFullModal).toHaveScreenshot(
    "quiz-modal-answer.png",
  );
});

test("screenshot-mime-modal", async ({ page }) => {
  await page.setViewportSize(VIEWPORT);
  const squares = Array.from({ length: 10 }, (_, i) => new MimeSquare(i));
  const players = ["Alice", "Bob"].map((name, i) => new Player(i, name));
  const board = new Board(squares, players);
  const game = new Game(board);

  const gamePage = new GamePage(page);
  await addZustandInitScript(gamePage.page, game.toJSON());
  await page.goto("/tesi/game");

  await gamePage.playTurnButton.click();
  await gamePage.rollDiceButton.click();

  await expect(gamePage.turnResultFullModal).toBeVisible();
  await expect(gamePage.turnResultFullModal).toHaveScreenshot("mime-modal.png");
});

test("screenshot-mime-modal-topic", async ({ page }) => {
  await page.setViewportSize(VIEWPORT);
  const squares = Array.from({ length: 10 }, (_, i) => new MimeSquare(i));
  const players = ["Alice", "Bob"].map((name, i) => new Player(i, name));
  const board = new Board(squares, players);
  const game = new Game(board);

  const gamePage = new GamePage(page);
  await addZustandInitScript(gamePage.page, game.toJSON());
  await page.goto("/tesi/game");

  await gamePage.playTurnButton.click();
  await gamePage.rollDiceButton.click();

  await expect(gamePage.turnResultFullModal).toBeVisible();
  await gamePage.mimeShowTopicButton.click();

  await expect(gamePage.turnResultFullModal).toHaveScreenshot(
    "mime-modal-topic.png",
  );
});

test("screenshot-backwrite-modal", async ({ page }) => {
  await page.setViewportSize(VIEWPORT);
  const squares = Array.from({ length: 10 }, (_, i) => new BackWriteSquare(i));
  const players = ["Alice", "Bob"].map((name, i) => new Player(i, name));
  const board = new Board(squares, players);
  const game = new Game(board);

  const gamePage = new GamePage(page);
  await addZustandInitScript(gamePage.page, game.toJSON());
  await page.goto("/tesi/game");

  await gamePage.playTurnButton.click();
  await gamePage.rollDiceButton.click();

  await expect(gamePage.turnResultFullModal).toBeVisible();
  await expect(gamePage.turnResultFullModal).toHaveScreenshot(
    "backwrite-modal.png",
  );
});

test("screenshot-backwrite-modal-word", async ({ page }) => {
  await page.setViewportSize(VIEWPORT);
  const squares = Array.from({ length: 10 }, (_, i) => new BackWriteSquare(i));
  const players = ["Alice", "Bob"].map((name, i) => new Player(i, name));
  const board = new Board(squares, players);
  const game = new Game(board);

  const gamePage = new GamePage(page);
  await addZustandInitScript(gamePage.page, game.toJSON());
  await page.goto("/tesi/game");

  await gamePage.playTurnButton.click();
  await gamePage.rollDiceButton.click();

  await expect(gamePage.turnResultFullModal).toBeVisible();
  await gamePage.backwriteShowWordButton.click();

  await expect(gamePage.turnResultFullModal).toHaveScreenshot(
    "backwrite-modal-word.png",
  );
});

test("screenshot-dictation-draw-modal", async ({ page }) => {
  await page.setViewportSize(VIEWPORT);
  const squares = Array.from(
    { length: 10 },
    (_, i) => new DictationDrawSquare(i),
  );
  const players = ["Alice", "Bob"].map((name, i) => new Player(i, name));
  const board = new Board(squares, players);
  const game = new Game(board);

  const gamePage = new GamePage(page);
  await addZustandInitScript(gamePage.page, game.toJSON());
  await page.goto("/tesi/game");

  await gamePage.playTurnButton.click();
  await gamePage.rollDiceButton.click();

  await expect(gamePage.turnResultFullModal).toBeVisible();
  await expect(gamePage.turnResultFullModal).toHaveScreenshot(
    "dictation-draw-modal.png",
  );
});

test("screenshot-dictation-draw-modal-image", async ({ page }) => {
  await page.setViewportSize(VIEWPORT);
  const squares = Array.from(
    { length: 10 },
    (_, i) => new DictationDrawSquare(i),
  );
  const players = ["Alice", "Bob"].map((name, i) => new Player(i, name));
  const board = new Board(squares, players);
  const game = new Game(board);

  const gamePage = new GamePage(page);
  await addZustandInitScript(gamePage.page, game.toJSON());
  await page.goto("/tesi/game");

  await gamePage.playTurnButton.click();
  await gamePage.rollDiceButton.click();

  await expect(gamePage.turnResultFullModal).toBeVisible();
  await gamePage.dictationDrawShowImageButton.click();

  await expect(gamePage.turnResultFullModal).toHaveScreenshot(
    "dictation-draw-modal-image.png",
  );
});

test("screenshot-face-emotion-modal", async ({ page }) => {
  await page.setViewportSize(VIEWPORT);
  const squares = Array.from(
    { length: 10 },
    (_, i) => new FaceEmotionSquare(i),
  );
  const players = ["Alice", "Bob"].map((name, i) => new Player(i, name));
  const board = new Board(squares, players);
  const game = new Game(board);

  const gamePage = new GamePage(page);
  await addZustandInitScript(gamePage.page, game.toJSON());
  await page.goto("/tesi/game");

  await gamePage.playTurnButton.click();
  await gamePage.rollDiceButton.click();

  await expect(gamePage.turnResultFullModal).toBeVisible();
  await expect(gamePage.turnResultFullModal).toHaveScreenshot(
    "face-emotion-modal.png",
  );
});

test("screenshot-face-emotion-modal-answer", async ({ page }) => {
  await page.setViewportSize(VIEWPORT);
  const squares = Array.from(
    { length: 10 },
    (_, i) => new FaceEmotionSquare(i),
  );
  const players = ["Alice", "Bob"].map((name, i) => new Player(i, name));
  const board = new Board(squares, players);
  const game = new Game(board);

  const gamePage = new GamePage(page);
  await addZustandInitScript(gamePage.page, game.toJSON());
  await page.goto("/tesi/game");

  await gamePage.playTurnButton.click();
  await gamePage.rollDiceButton.click();

  await expect(gamePage.turnResultFullModal).toBeVisible();
  await gamePage.faceEmotionShowAnswerButton.click();

  await expect(gamePage.turnResultFullModal).toHaveScreenshot(
    "face-emotion-modal-answer.png",
  );
});

test("screenshot-music-emotion-modal", async ({ page }) => {
  await page.setViewportSize(VIEWPORT);
  const squares = Array.from(
    { length: 10 },
    (_, i) => new MusicEmotionSquare(i),
  );
  const players = ["Alice", "Bob"].map((name, i) => new Player(i, name));
  const board = new Board(squares, players);
  const game = new Game(board);

  const gamePage = new GamePage(page);
  await addZustandInitScript(gamePage.page, game.toJSON());
  await page.goto("/tesi/game");

  await gamePage.playTurnButton.click();
  await gamePage.rollDiceButton.click();

  await expect(gamePage.turnResultFullModal).toBeVisible();
  await expect(gamePage.turnResultFullModal).toHaveScreenshot(
    "music-emotion-modal.png",
  );
});

test("screenshot-physical-test-modal", async ({ page }) => {
  await page.setViewportSize(VIEWPORT);
  const squares = Array.from(
    { length: 10 },
    (_, i) => new PhysicalTestSquare(i),
  );
  const players = ["Alice", "Bob"].map((name, i) => new Player(i, name));
  const board = new Board(squares, players);
  const game = new Game(board);

  const gamePage = new GamePage(page);
  await addZustandInitScript(gamePage.page, game.toJSON());
  await page.goto("/tesi/game");

  await gamePage.playTurnButton.click();
  await gamePage.rollDiceButton.click();

  await expect(gamePage.turnResultFullModal).toBeVisible();
  await expect(gamePage.turnResultFullModal).toHaveScreenshot(
    "physical-test-modal.png",
  );
});

test("screenshot-what-would-you-do-modal", async ({ page }) => {
  await page.setViewportSize(VIEWPORT);
  const squares = Array.from(
    { length: 10 },
    (_, i) => new WhatWouldYouDoSquare(i),
  );
  const players = ["Alice", "Bob"].map((name, i) => new Player(i, name));
  const board = new Board(squares, players);
  const game = new Game(board);

  const gamePage = new GamePage(page);
  await addZustandInitScript(gamePage.page, game.toJSON());
  await page.goto("/tesi/game");

  await gamePage.playTurnButton.click();
  await gamePage.rollDiceButton.click();

  await expect(gamePage.turnResultFullModal).toBeVisible();
  await expect(gamePage.turnResultFullModal).toHaveScreenshot(
    "what-would-you-do-modal.png",
  );
});

test("screenshot-skip-turn-modal", async ({ page }) => {
  await page.setViewportSize(VIEWPORT);
  const squares = Array.from({ length: 25 }, (_, i) => new Square(i));
  const players = ["Alice", "Bob"].map((name, i) => new Player(i, name));
  const board = new Board(squares, players);
  const game = new Game(board);
  players[0].skipNextTurn();

  const gameData = game.toJSON();
  gameData.board.playersPosition[0].position = 3;
  gameData.board.playersPosition[1].position = 1;

  const gamePage = new GamePage(page);
  await addZustandInitScript(gamePage.page, gameData);
  await page.goto("/tesi/game");

  await gamePage.playTurnButton.click();
  await gamePage.skipTurnButton.waitFor();

  await expect(page).toHaveScreenshot("skip-turn-modal.png");
});

test("screenshot-end-game", async ({ page }) => {
  await page.setViewportSize(VIEWPORT);
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

  await gamePage.playTurnButton.click();
  await gamePage.rollDiceButton.waitFor();
  await gamePage.rollDiceButton.click();

  expect(await gamePage.getWinner()).toMatch(/Alice|Bob/);

  await expect(page).toHaveScreenshot("end-game.png");
});
