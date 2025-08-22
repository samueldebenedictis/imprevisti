import type { Page } from "@playwright/test";

export class GamePage {
  constructor(readonly page: Page) {}

  url = "/game";

  async goto() {
    this.page.goto(this.url);
  }
}
