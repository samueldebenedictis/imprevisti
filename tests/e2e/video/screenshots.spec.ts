import type { Page } from "@playwright/test";
import { Board } from "@/model/board";
import { Game } from "@/model/game";
import { Player } from "@/model/player";
import { Square } from "@/model/square";
import { expect, test } from "../app/fixtures";
import { GamePage } from "../app/pages/game-page";
import { HomePage } from "../app/pages/home-page";
import { addZustandInitScript } from "../app/zustand";

const VIEWPORT = { width: 1920, height: 1080 };

/**
 * Replaces Math.random with a seeded LCG so that deck shuffles and dice rolls
 * always produce the same sequence, making screenshots deterministic.
 */
async function seedRandom(page: Page, seed = 42) {
  await page.addInitScript((s: number) => {
    let state = s;
    Math.random = () => {
      state = (state * 1664525 + 1013904223) >>> 0;
      return state / 4294967296;
    };
  }, seed);
}

test("screenshot-home", async ({ page }) => {
  await page.setViewportSize(VIEWPORT);
  await page.addInitScript(() => sessionStorage.removeItem("gameMode"));
  await page.goto("/");

  await expect(
    page.getByRole("button", { name: /Schermo singolo/ }),
  ).toBeVisible();
  await expect(page).toHaveScreenshot("home.png", { fullPage: true });
});

test("screenshot-home-filled", async ({ page }) => {
  await page.setViewportSize(VIEWPORT);
  await page.addInitScript(() => sessionStorage.removeItem("gameMode"));
  await page.goto("/");
  const homePage = new HomePage(page);

  await homePage.selectSingleMode();

  await homePage.playersNumber.clear();
  await homePage.playersNumber.pressSequentially("3");
  await homePage.playerName(1).pressSequentially("Alice");
  await homePage.playerName(2).pressSequentially("Bob");
  await homePage.playerName(3).pressSequentially("Carol");
  await homePage.squaresNumber.clear();
  await homePage.squaresNumber.pressSequentially("20");

  await expect(page).toHaveScreenshot("home-filled.png", { fullPage: true });
});

test("screenshot-advanced-mode", async ({ page }) => {
  await page.setViewportSize(VIEWPORT);
  await page.addInitScript(() => sessionStorage.removeItem("gameMode"));
  await page.goto("/");
  const homePage = new HomePage(page);

  await homePage.selectSingleMode();
  await homePage.advancedModeButton.click();

  await expect(page).toHaveScreenshot("advanced-mode.png", { fullPage: true });
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
  await seedRandom(page);
  await addZustandInitScript(gamePage.page, gameData);
  await page.goto("/game");

  await expect(page).toHaveScreenshot("game-board.png", { fullPage: true });
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
  await seedRandom(page);
  await addZustandInitScript(gamePage.page, gameData);
  await page.goto("/game");

  await gamePage.playTurnButton.click();
  await gamePage.rollDiceButton.waitFor();

  await expect(page).toHaveScreenshot("dice-roll.png", { fullPage: true });
});

test("screenshot-quiz-modal-answer", async ({ page }) => {
  await page.setViewportSize(VIEWPORT);
  const gamePage = new GamePage(page);
  await page.goto(
    "/storybook/iframe.html?id=example-turnresultmodal--quiz-scenario&viewMode=story",
  );

  await expect(gamePage.turnResultFullModal).toBeVisible();
  await expect(gamePage.turnResultFullModal).toHaveScreenshot("quiz-modal.png");

  await gamePage.quizShowAnswerButton.click();

  await expect(gamePage.turnResultFullModal).toHaveScreenshot(
    "quiz-modal-answer.png",
  );
});

test("screenshot-mime-modal-topic", async ({ page }) => {
  await page.setViewportSize(VIEWPORT);
  const gamePage = new GamePage(page);
  await page.goto(
    "/storybook/iframe.html?id=example-turnresultmodal--mime-scenario&viewMode=story",
  );

  await expect(gamePage.turnResultFullModal).toBeVisible();
  await expect(gamePage.turnResultFullModal).toHaveScreenshot("mime-modal.png");

  await gamePage.mimeShowTopicButton.click();

  await expect(gamePage.turnResultFullModal).toHaveScreenshot(
    "mime-modal-topic.png",
  );
});

test("screenshot-backwrite-modal", async ({ page }) => {
  await page.setViewportSize(VIEWPORT);
  const gamePage = new GamePage(page);
  await page.goto(
    "/storybook/iframe.html?id=example-turnresultmodal--back-write-scenario&viewMode=story",
  );

  await expect(gamePage.turnResultFullModal).toBeVisible();
  await expect(gamePage.turnResultFullModal).toHaveScreenshot(
    "backwrite-modal.png",
  );
});

test("screenshot-backwrite-modal-word", async ({ page }) => {
  await page.setViewportSize(VIEWPORT);
  const gamePage = new GamePage(page);
  await page.goto(
    "/storybook/iframe.html?id=example-turnresultmodal--back-write-scenario&viewMode=story",
  );

  await expect(gamePage.turnResultFullModal).toBeVisible();
  await gamePage.backwriteShowWordButton.click();

  await expect(gamePage.turnResultFullModal).toHaveScreenshot(
    "backwrite-modal-word.png",
  );
});

test("screenshot-dictation-draw-modal", async ({ page }) => {
  await page.setViewportSize(VIEWPORT);
  const gamePage = new GamePage(page);
  await page.goto(
    "/storybook/iframe.html?id=example-turnresultmodal--dictation-draw-scenario&viewMode=story",
  );

  await expect(gamePage.turnResultFullModal).toBeVisible();
  await expect(gamePage.turnResultFullModal).toHaveScreenshot(
    "dictation-draw-modal.png",
  );
});

test("screenshot-dictation-draw-modal-image", async ({ page }) => {
  await page.setViewportSize(VIEWPORT);
  const gamePage = new GamePage(page);
  await page.goto(
    "/storybook/iframe.html?id=example-turnresultmodal--dictation-draw-scenario&viewMode=story",
  );

  await expect(gamePage.turnResultFullModal).toBeVisible();
  await gamePage.dictationDrawShowImageButton.click();

  await expect(gamePage.turnResultFullModal).toHaveScreenshot(
    "dictation-draw-modal-image.png",
  );
});

test("screenshot-face-emotion-modal-answer", async ({ page }) => {
  await page.setViewportSize(VIEWPORT);
  const gamePage = new GamePage(page);
  await page.goto(
    "/storybook/iframe.html?id=example-turnresultmodal--face-emotion-scenario&viewMode=story",
  );

  await expect(gamePage.turnResultFullModal).toBeVisible();
  await expect(gamePage.turnResultFullModal).toHaveScreenshot(
    "face-emotion-modal.png",
  );

  await gamePage.faceEmotionShowAnswerButton.click();

  await expect(gamePage.turnResultFullModal).toHaveScreenshot(
    "face-emotion-modal-answer.png",
  );
});

test("screenshot-music-emotion-modal", async ({ page }) => {
  await page.setViewportSize(VIEWPORT);
  const gamePage = new GamePage(page);
  await page.goto(
    "/storybook/iframe.html?id=example-turnresultmodal--music-emotion-scenario&viewMode=story",
  );

  await expect(gamePage.turnResultFullModal).toBeVisible();
  await expect(gamePage.turnResultFullModal).toHaveScreenshot(
    "music-emotion-modal.png",
  );
});

test("screenshot-physical-test-modal", async ({ page }) => {
  await page.setViewportSize(VIEWPORT);
  const gamePage = new GamePage(page);
  await page.goto(
    "/storybook/iframe.html?id=example-turnresultmodal--physical-test-scenario&viewMode=story",
  );

  await expect(gamePage.turnResultFullModal).toBeVisible();
  await expect(gamePage.turnResultFullModal).toHaveScreenshot(
    "physical-test-modal.png",
  );
});

test("screenshot-what-would-you-do-modal", async ({ page }) => {
  await page.setViewportSize(VIEWPORT);
  const gamePage = new GamePage(page);
  await page.goto(
    "/storybook/iframe.html?id=example-turnresultmodal--what-would-you-do-scenario&viewMode=story",
  );

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
  await seedRandom(page);
  await addZustandInitScript(gamePage.page, gameData);
  await page.goto("/game");

  await gamePage.playTurnButton.click();
  await gamePage.skipTurnButton.waitFor();

  await expect(page).toHaveScreenshot("skip-turn-modal.png", {
    fullPage: true,
  });
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
  await seedRandom(page);
  await addZustandInitScript(gamePage.page, gameData);
  await page.goto("/game");

  await gamePage.playTurnButton.click();
  await gamePage.rollDiceButton.waitFor();
  await gamePage.rollDiceButton.click();

  expect(await gamePage.getWinner()).toMatch(/Alice|Bob/);

  await page.waitForTimeout(1000);

  await expect(page).toHaveScreenshot("end-game.png", { fullPage: true });
});

test("screenshot-feedback", async ({ page }) => {
  await page.setViewportSize(VIEWPORT);
  await page.goto("/feedback");

  await expect(page).toHaveScreenshot("feedback.png", { fullPage: true });
});

// Dataset fisso con punteggi medio-alti (SUS "Eccellente"/"Buono"), usato come
// riferimento visivo stabile per la dashboard feedback (es. screenshot in
// tesi): submittedAt è una data fissa, non "adesso", altrimenti lo screenshot
// cambierebbe pixel a ogni esecuzione. Niente whatWorkedWell/challenges/
// suggestions: la sezione "Commenti liberi" resta vuota (esiste comunque
// nell'app) solo per non allungare inutilmente questo screenshot.
const FEEDBACK_DASHBOARD_FIXTURE = [
  {
    id: "1",
    submittedAt: "2026-03-01T09:00:00.000Z",
    name: "Giulia",
    ageGroup: "alunno",
    gameExperience: "digitale",
    autismIdentification: "no",
    digitalVsPhysical: 5,
    gameplayClarity: 5,
    graphics: 4,
    enjoyment: 5,
    funLevel: 5,
    sus1: 5,
    sus2: 1,
    sus3: 5,
    sus4: 1,
    sus5: 5,
    sus6: 2,
    sus7: 5,
    sus8: 1,
    sus9: 4,
    sus10: 1,
  },
  {
    id: "2",
    submittedAt: "2026-03-02T09:00:00.000Z",
    name: "Marco",
    ageGroup: "docente",
    gameExperience: "esperto",
    autismIdentification: "si_diagnosi",
    digitalVsPhysical: 4,
    gameplayClarity: 5,
    graphics: 5,
    enjoyment: 4,
    funLevel: 5,
    sus1: 5,
    sus2: 1,
    sus3: 4,
    sus4: 1,
    sus5: 5,
    sus6: 1,
    sus7: 4,
    sus8: 2,
    sus9: 5,
    sus10: 1,
  },
  {
    id: "3",
    submittedAt: "2026-03-03T09:00:00.000Z",
    name: "Sofia",
    ageGroup: "alunno",
    gameExperience: "fisico",
    autismIdentification: "no",
    digitalVsPhysical: 5,
    gameplayClarity: 4,
    graphics: 5,
    enjoyment: 5,
    funLevel: 4,
    sus1: 4,
    sus2: 1,
    sus3: 5,
    sus4: 1,
    sus5: 5,
    sus6: 1,
    sus7: 5,
    sus8: 2,
    sus9: 4,
    sus10: 1,
  },
  {
    id: "4",
    submittedAt: "2026-03-04T09:00:00.000Z",
    name: "Luca",
    ageGroup: "docente",
    gameExperience: "esperto",
    autismIdentification: "si_non_diagnosticato",
    digitalVsPhysical: 4,
    gameplayClarity: 4,
    graphics: 4,
    enjoyment: 5,
    funLevel: 5,
    sus1: 5,
    sus2: 2,
    sus3: 4,
    sus4: 1,
    sus5: 5,
    sus6: 1,
    sus7: 4,
    sus8: 1,
    sus9: 5,
    sus10: 2,
  },
  {
    id: "5",
    submittedAt: "2026-03-05T09:00:00.000Z",
    name: "Alice",
    ageGroup: "alunno",
    gameExperience: "digitale",
    autismIdentification: "preferisco_non_rispondere",
    digitalVsPhysical: 5,
    gameplayClarity: 5,
    graphics: 4,
    enjoyment: 5,
    funLevel: 4,
    sus1: 5,
    sus2: 1,
    sus3: 5,
    sus4: 2,
    sus5: 4,
    sus6: 1,
    sus7: 5,
    sus8: 1,
    sus9: 5,
    sus10: 1,
  },
  {
    id: "6",
    submittedAt: "2026-03-06T09:00:00.000Z",
    name: "Davide",
    ageGroup: "none",
    gameExperience: "fisico",
    autismIdentification: "no",
    digitalVsPhysical: 4,
    gameplayClarity: 4,
    graphics: 4,
    enjoyment: 4,
    funLevel: 5,
    sus1: 4,
    sus2: 1,
    sus3: 4,
    sus4: 2,
    sus5: 5,
    sus6: 1,
    sus7: 4,
    sus8: 1,
    sus9: 5,
    sus10: 1,
  },
  {
    id: "7",
    submittedAt: "2026-03-07T09:00:00.000Z",
    name: "Francesca",
    ageGroup: "docente",
    gameExperience: "esperto",
    autismIdentification: "preferisco_non_rispondere",
    digitalVsPhysical: 5,
    gameplayClarity: 4,
    graphics: 4,
    enjoyment: 4,
    funLevel: 4,
    sus1: 5,
    sus2: 1,
    sus3: 5,
    sus4: 1,
    sus5: 4,
    sus6: 2,
    sus7: 5,
    sus8: 1,
    sus9: 4,
    sus10: 1,
  },
  {
    id: "8",
    submittedAt: "2026-03-08T09:00:00.000Z",
    name: "Matteo",
    ageGroup: "alunno",
    gameExperience: "digitale",
    autismIdentification: "si_diagnosi",
    digitalVsPhysical: 5,
    gameplayClarity: 5,
    graphics: 5,
    enjoyment: 4,
    funLevel: 5,
    sus1: 5,
    sus2: 1,
    sus3: 5,
    sus4: 1,
    sus5: 5,
    sus6: 1,
    sus7: 4,
    sus8: 2,
    sus9: 5,
    sus10: 1,
  },
];

test("screenshot-feedback-dashboard", async ({ page }) => {
  await page.setViewportSize(VIEWPORT);

  await page.route("**/api/feedback**", async (route, request) => {
    if (request.method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(FEEDBACK_DASHBOARD_FIXTURE),
      });
    } else {
      await route.continue();
    }
  });

  await page.goto("/admin/feedback");
  await page.getByLabel("Codice di accesso").fill("test-secret");
  await page.getByRole("button", { name: "Accedi" }).click();

  await expect(page.getByText("Punteggio SUS medio")).toBeVisible();
  await expect(page.getByText("8 risposte")).toBeVisible();
  await expect(page).toHaveScreenshot("feedback-dashboard.png", {
    fullPage: true,
  });
});

test("screenshot-menu", async ({ page }) => {
  await page.setViewportSize(VIEWPORT);
  const squares = Array.from({ length: 25 }, (_, i) => new Square(i));
  const players = ["Alice", "Bob"].map((name, i) => new Player(i, name));
  const board = new Board(squares, players);
  const game = new Game(board);

  const gamePage = new GamePage(page);
  await seedRandom(page);
  await addZustandInitScript(gamePage.page, game.toJSON());
  await page.goto("/game");

  await page.getByRole("button", { name: "MENU", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(2);

  await expect(page.getByRole("dialog").last()).toHaveScreenshot("menu.png");
});
