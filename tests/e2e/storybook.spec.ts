import { expect, test } from "@playwright/test";

test("Has title", async ({ page }) => {
  await page.goto("http://localhost:6006/");
  await expect(page).toHaveTitle(/Storybook/);
});
