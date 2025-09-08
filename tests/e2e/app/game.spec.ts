import { STORAGE_STATE_KEY_GAME_INSTANCE } from "@/app/vars";
import { Board, SquaresBuilder } from "@/model/board";
import { Game } from "@/model/game";
import { Player } from "@/model/player";
import { expect, test } from "./fixtures";

test("Fill form", async ({ homePage }) => {
  await homePage.playersNumber.fill("3");
  await homePage.playerName(1).fill("Qui");
  await homePage.playerName(2).fill("Quo");
  await homePage.playerName(3).fill("Qua");
  await homePage.squaresNumber.fill("25");

  await homePage.page.getByRole("checkbox", { name: "Caselle mimo" }).uncheck();
  await homePage.page.getByRole("checkbox", { name: "Caselle quiz" }).uncheck();
  await homePage.page
    .getByRole("checkbox", { name: "Caselle movimento" })
    .uncheck();

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
  const squares = new SquaresBuilder().setBoardSize(10).build();
  const players = ["Alice", "Bob"].map((name, i) => new Player(i, name));
  const board = new Board(squares, players);
  const game = new Game(board, players);

  players[0].skipNextTurn();
  const gameJSON = JSON.stringify(game.toJSON());
  await page.addInitScript(
    ([gameData, storageKey]) => {
      localStorage.setItem(storageKey, gameData);
    },
    [gameJSON, STORAGE_STATE_KEY_GAME_INSTANCE],
  );

  await page.goto("/game");

  await page.getByRole("button", { name: "Gioca un turno" }).click();

  await page.getByRole("button", { name: "Lancia il dado" }).click();

  await expect(page.getByText("Alice deve saltare il turno!")).toBeVisible();

  await page.getByRole("button", { name: "Continua" }).click();

  await expect(
    page.getByText("Alice deve saltare il turno!"),
  ).not.toBeVisible();
});
