import { test as base } from "@playwright/test";
import { GamePage } from "./pages/game-page";
import { HomePage } from "./pages/home-page";

type Fixtures = {
  gamePage: GamePage;
  homePage: HomePage;
};

export const test = base.extend<Fixtures>({
  homePage: async ({ page }, use) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    await use(homePage);
  },

  gamePage: async ({ page }, use) => {
    const gamePage = new GamePage(page);
    await gamePage.goto();
    await use(gamePage);
  },
});

export { expect } from "@playwright/test";
