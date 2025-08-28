import { expect, test } from "./fixtures";

test("Fill form", async ({ homePage }) => {
  await homePage.playersNumber.fill("3");
  await homePage.playerName(1).fill("Qui");
  await homePage.playerName(2).fill("Quo");
  await homePage.playerName(3).fill("Qua");
  await homePage.squaresNumber.fill("25");

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
