import type { Page } from "@playwright/test";

export class HomePage {
  constructor(readonly page: Page) {}

  url = "/";

  async goto() {
    await this.page.goto(this.url);
  }

  playersNumber = this.page.getByRole("spinbutton", {
    name: "Number of Players:",
  });
  playerName = (number: string) =>
    this.page.getByRole("textbox", { name: `Player ${number} Name:` });
  squaresNumber = this.page.getByRole("spinbutton", {
    name: "Number of Squares:",
  });
  submit = this.page.getByRole("button", { name: "Start Game" });
}
