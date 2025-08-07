import { expect, test } from "@playwright/test";

test("Fill form", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("spinbutton", { name: "Number of Players:" }).fill("3");
  await page.getByRole("textbox", { name: "Player 1 Name:" }).fill("Qui");
  await page.getByRole("textbox", { name: "Player 2 Name:" }).fill("Quo");
  await page.getByRole("textbox", { name: "Player 3 Name:" }).fill("Qua");
  await page.getByRole("spinbutton", { name: "Number of Squares:" }).fill("25");

  await page.getByRole("button", { name: "Start Game" }).click();
  await expect(page).toHaveURL(/game/);

  const storageState = await page.context().storageState();
  expect(
    JSON.stringify(storageState.origins[0].localStorage, undefined, 2),
  ).toMatchSnapshot("e2e-config.json");
});
