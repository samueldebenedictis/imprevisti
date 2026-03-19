import { LABEL_MIME, LABEL_SPECIAL_SQUARES, SQUARE_QUIZ } from "@/app/texts";
import { expect, test } from "./fixtures";
import { AdvancedModePage } from "./pages/advanced-mode-page";

test.describe("Advanced mode", () => {
  test("Advanced mode button navigates to /advanced-mode", async ({
    homePage,
  }) => {
    await homePage.advancedModeButton.click();
    await expect(homePage.page).toHaveURL(/advanced-mode/);
  });

  test("Cancel returns to home without saving", async ({ homePage }) => {
    await homePage.advancedModeButton.click();
    const advancedPage = new AdvancedModePage(homePage.page);
    await advancedPage.cancelButton.click();
    await expect(homePage.page).toHaveURL("/");
    await expect(homePage.advancedModeActiveText).not.toBeVisible();
  });

  test("Apply returns to home with active indicator", async ({ homePage }) => {
    await homePage.advancedModeButton.click();
    const advancedPage = new AdvancedModePage(homePage.page);
    await advancedPage.applyButton.click();
    await expect(homePage.page).toHaveURL("/");
    await expect(homePage.advancedModeActiveText).toBeVisible();
  });

  test("First square shows START and is locked", async ({ homePage }) => {
    await homePage.advancedModeButton.click();
    await expect(homePage.page.getByText("START")).toBeVisible();
    await expect(homePage.page.getByText("FINE")).toBeVisible();
  });

  test("Reset button resets all squares to normal", async ({ homePage }) => {
    await homePage.advancedModeButton.click();
    const advancedPage = new AdvancedModePage(homePage.page);

    await advancedPage.squareTypeSelect(1).selectOption("quiz");
    await advancedPage.squareTypeSelect(2).selectOption("mime");
    await advancedPage.resetButton.click();

    await expect(advancedPage.squareTypeSelect(1)).toHaveValue("normal");
    await expect(advancedPage.squareTypeSelect(2)).toHaveValue("normal");
  });

  test("Selecting move type shows move value input", async ({ homePage }) => {
    await homePage.advancedModeButton.click();
    const advancedPage = new AdvancedModePage(homePage.page);

    await advancedPage.squareTypeSelect(1).selectOption("move");
    await expect(advancedPage.moveValueInput(1)).toBeVisible();
  });

  test("Move value input is not visible for non-move squares", async ({
    homePage,
  }) => {
    await homePage.advancedModeButton.click();
    const advancedPage = new AdvancedModePage(homePage.page);

    await advancedPage.squareTypeSelect(1).selectOption("quiz");
    await expect(advancedPage.moveValueInput(1)).not.toBeVisible();
  });

  test("Move value input reflects the entered value", async ({ homePage }) => {
    await homePage.advancedModeButton.click();
    const advancedPage = new AdvancedModePage(homePage.page);

    await advancedPage.squareTypeSelect(1).selectOption("move");
    await advancedPage.moveValueInput(1).fill("3");
    await expect(advancedPage.moveValueInput(1)).toHaveValue("3");
  });

  test("Checkboxes are hidden when advanced config is active", async ({
    homePage,
  }) => {
    await homePage.advancedModeButton.click();
    const advancedPage = new AdvancedModePage(homePage.page);
    await advancedPage.applyButton.click();

    await expect(
      homePage.page.getByText(LABEL_SPECIAL_SQUARES),
    ).not.toBeVisible();
    await expect(
      homePage.page.getByRole("checkbox", { name: LABEL_MIME }),
    ).not.toBeVisible();
  });

  test("Removing custom config restores checkboxes", async ({ homePage }) => {
    await homePage.advancedModeButton.click();
    const advancedPage = new AdvancedModePage(homePage.page);
    await advancedPage.applyButton.click();

    await homePage.removeCustomSquaresButton.click();

    await expect(
      homePage.page.getByRole("checkbox", { name: LABEL_MIME }),
    ).toBeVisible();
  });

  test("Game uses the manually configured board", async ({ homePage }) => {
    // Set up: 10 squares, 2 players
    await homePage.squaresNumber.fill("10");
    await homePage.playerName(1).fill("Alice");
    await homePage.playerName(2).fill("Bob");

    // Go to advanced mode and set squares 1-8 all to quiz
    await homePage.advancedModeButton.click();
    const advancedPage = new AdvancedModePage(homePage.page);
    for (let i = 1; i <= 8; i++) {
      await advancedPage.squareTypeSelect(i).selectOption("quiz");
    }
    await advancedPage.applyButton.click();

    // Start the game
    const gamePage = await homePage.submitAndGotoGame();

    // Board should contain exactly 8 quiz squares
    await expect(gamePage.page.getByText(SQUARE_QUIZ)).toHaveCount(8);
  });
});
