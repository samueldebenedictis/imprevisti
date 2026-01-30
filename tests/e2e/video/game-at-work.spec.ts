import { expect, test } from "../app/fixtures";
import { HomePage } from "../app/pages/home-page";

const TIMEOUT = 500;

test("setup", async ({ page }) => {
  await page.goto("/tesi");
  const homePage = new HomePage(page);

  await homePage.page.waitForTimeout(TIMEOUT);
  await homePage.playersNumber.fill("3");
  await homePage.page.waitForTimeout(TIMEOUT);
  await homePage.playerName(1).fill("Qui");
  await homePage.page.waitForTimeout(TIMEOUT);
  await homePage.playerName(2).fill("Quo");
  await homePage.page.waitForTimeout(TIMEOUT);
  await homePage.playerName(3).fill("Qua");
  await homePage.page.waitForTimeout(TIMEOUT);
  await homePage.squaresNumber.fill("25");
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
