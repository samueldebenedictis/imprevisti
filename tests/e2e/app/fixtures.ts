import { test as base } from "@playwright/test";
import { GamePage } from "./pages/game-page";

type Fixtures = {
  gamePage: GamePage;
};

export const test = base.extend<Fixtures>({
  gamePage: async ({ page }, use) => {
    const gamePage = new GamePage(page);
    await gamePage.goto();
    await use(gamePage);
  },
});

export { expect } from "@playwright/test";
