import { Board } from "@/model/board";
import { Game } from "@/model/game";
import { Player } from "@/model/player";
import { Square } from "@/model/square";
import { expect, test } from "./fixtures";
import { GamePage } from "./pages/game-page";

test("Fill form @snapshot", async ({ homePage }) => {
  await homePage.playersNumber.fill("3");
  await homePage.playerName(1).fill("Qui");
  await homePage.playerName(2).fill("Quo");
  await homePage.playerName(3).fill("Qua");
  await homePage.squaresNumber.fill("25");

  await homePage.mimeCheckbox.uncheck();
  await homePage.quizCheckbox.uncheck();
  await homePage.moveCheckbox.uncheck();
  await homePage.backwriteCheckbox.uncheck();
  await homePage.musicEmotionCheckbox.uncheck();
  await homePage.physicalTestCheckbox.uncheck();
  await homePage.whatWouldYouDoCheckbox.uncheck();
  await homePage.dictationDrawCheckbox.uncheck();
  await homePage.faceEmotionsCheckbox.uncheck();

  await homePage.submit.click();
  await expect(homePage.page).toHaveURL(/game/);

  const storageState = await homePage.page.context().storageState();
  const storageGame = storageState.origins[0].localStorage.map((el) => {
    return {
      name: el.name,
      value: JSON.parse(el.value),
    };
  });

  expect(JSON.stringify(storageGame, undefined, 2)).toMatchSnapshot(
    "e2e-config.json",
  );
});

test("Player skip turn modal", async ({ page }) => {
  const gamePage = new GamePage(page);
  const squares = Array.from(Array(10).keys()).map((_, i) => new Square(i));
  const players = ["Alice", "Bob"].map((name, i) => new Player(i, name));
  const board = new Board(squares, players);
  const game = new Game(board);

  players[0].skipNextTurn();
  const gameData = game.toJSON();

  await page.addInitScript(
    ([gameData]) => {
      const zustandData = {
        state: {
          game: null,
          gameData: gameData,
          counter: 0,
          isModalOpen: false,
          isDiceModalOpen: false,
          isRolling: false,
          diceResult: null,
          modalDiceResult: null,
          actionType: null,
          actionData: null,
          playerWhoRolledName: null,
          playerWhoRolled: null,
          startPosition: undefined,
          newPosition: undefined,
          hasSavedGame: true,
          selectedFile: null,
        },
        version: 0,
      };
      localStorage.setItem("game-store", JSON.stringify(zustandData));
    },
    [gameData],
  );

  await gamePage.goto();

  await gamePage.playTurnButton.click();
  await gamePage.skipTurnButton.click();

  await expect(gamePage.skipTurnMessage("Alice")).toBeVisible();
  await gamePage.continueButton.click();
  await expect(gamePage.skipTurnMessage("Alice")).not.toBeVisible();
});

test("Play turns", async ({ homePage }) => {
  await homePage.playersNumber.fill("3");
  await homePage.playerName(1).fill("Qui");
  await homePage.playerName(2).fill("Quo");
  await homePage.playerName(3).fill("Qua");
  await homePage.squaresNumber.fill("25");
  // uncheck the move checkbox because
  // move square can send player back to square 0
  await homePage.moveCheckbox.uncheck();

  const gamePage = await homePage.submitAndGotoGame();

  await gamePage.playTurn();
  await gamePage.playTurn();
  await gamePage.playTurn();

  expect(await gamePage.getPlayerPosition(0)).toBeGreaterThan(0);
  expect(await gamePage.getPlayerPosition(1)).toBeGreaterThan(0);
  expect(await gamePage.getPlayerPosition(2)).toBeGreaterThan(0);
});

test("End game", async ({ homePage }) => {
  await homePage.playersNumber.fill("3");
  await homePage.playerName(1).fill("Qui");
  await homePage.playerName(2).fill("Quo");
  await homePage.playerName(3).fill("Qua");
  await homePage.squaresNumber.fill("10");

  await homePage.mimeCheckbox.uncheck();
  await homePage.quizCheckbox.uncheck();
  await homePage.moveCheckbox.uncheck();
  await homePage.backwriteCheckbox.uncheck();
  await homePage.musicEmotionCheckbox.uncheck();
  await homePage.physicalTestCheckbox.uncheck();
  await homePage.whatWouldYouDoCheckbox.uncheck();
  await homePage.dictationDrawCheckbox.uncheck();
  await homePage.faceEmotionsCheckbox.uncheck();

  const gamePage = await homePage.submitAndGotoGame();

  while (!(await gamePage.getWinner())) {
    await gamePage.playTurn();
  }
  expect(await gamePage.getWinner()).toMatch(/Qui|Quo|Qua/);
});
