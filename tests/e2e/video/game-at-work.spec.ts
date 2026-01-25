import type { Page } from "@playwright/test";
import { test } from "../app/fixtures";

async function actionWithTimeout(page: Page, action: () => Promise<void>) {
  await action();
  await page.waitForTimeout(1000);
}

test("App at work - Setup", async ({ homePage }) => {
  await actionWithTimeout(homePage.page, () => homePage.playersNumber.clear());
  await actionWithTimeout(homePage.page, () =>
    homePage.playersNumber.pressSequentially("3"),
  );
  await actionWithTimeout(homePage.page, () =>
    homePage.playerName(1).pressSequentially("Qui"),
  );
  await actionWithTimeout(homePage.page, () =>
    homePage.playerName(2).pressSequentially("Quo"),
  );
  await actionWithTimeout(homePage.page, () =>
    homePage.playerName(3).pressSequentially("Qua"),
  );
  await actionWithTimeout(homePage.page, () => homePage.squaresNumber.clear());
  await actionWithTimeout(homePage.page, () =>
    homePage.squaresNumber.pressSequentially("25"),
  );
});
