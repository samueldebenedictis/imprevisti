import { expect, test } from "./fixtures";

test("Pedine scelte in configurazione compaiono sul tabellone", async ({
  homePage,
}) => {
  await homePage.playersNumber.fill("3");
  for (const [i, name] of ["Luca", "Anna", "Sara"].entries())
    await homePage.playerName(i + 1).fill(name);

  // Si sceglie dalla finestra che si apre cliccando l'anteprima accanto al nome
  await homePage.choosePawn(2, { color: "pink", shape: "hexagon" });
  await homePage.choosePawn(3, { shape: "parallelogram" });
  await expect(homePage.pawnDialog).toHaveCount(0);
  await expect(
    homePage.pawnButton(2).locator('[data-shape="hexagon"]'),
  ).toBeVisible();

  for (const box of await homePage.page.getByRole("checkbox").all())
    if (await box.isChecked()) await box.uncheck();
  const gamePage = await homePage.submitAndGotoGame();

  // Tre giocatori sulla casella di partenza: si vedono tutte e tre le pedine
  const board = gamePage.page;
  for (const name of ["Luca", "Anna", "Sara"])
    await expect(
      board.locator("[data-shape]", { hasText: name }),
    ).toBeVisible();
  await expect(
    board.locator('[data-shape="hexagon"]', { hasText: "Anna" }),
  ).toBeVisible();
  await expect(
    board.locator('[data-shape="parallelogram"]', { hasText: "Sara" }),
  ).toBeVisible();
  await expect(board.getByText(/\d giocatori/)).toHaveCount(0);
});

test("Più di 3 giocatori sulla stessa casella: N giocatori", async ({
  homePage,
}) => {
  await homePage.playersNumber.fill("4");
  for (const [i, name] of ["Luca", "Anna", "Sara", "Marco"].entries())
    await homePage.playerName(i + 1).fill(name);
  for (const box of await homePage.page.getByRole("checkbox").all())
    if (await box.isChecked()) await box.uncheck();
  const gamePage = await homePage.submitAndGotoGame();

  await expect(gamePage.page.getByText("3 giocatori")).toBeVisible();
});

test("Finestra della pedina: si chiude con Esc o cliccando fuori", async ({
  homePage,
}) => {
  await homePage.playerName(1).fill("Luca");
  await homePage.pawnButton(1).click();
  await expect(homePage.pawnDialog).toBeVisible();
  await expect(homePage.pawnDialog.getByText("Pedina di Luca")).toBeVisible();
  await homePage.page.keyboard.press("Escape");
  await expect(homePage.pawnDialog).toHaveCount(0);

  await homePage.pawnButton(1).click();
  await homePage.page.mouse.click(5, 5);
  await expect(homePage.pawnDialog).toHaveCount(0);
});
