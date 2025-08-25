import type { Page } from "@playwright/test";
import { PLAYER_NAME, PLAYERS_NUMBER } from "@/app/texts";

export class HomePage {
  constructor(readonly page: Page) {}

  url = "/";

  async goto() {
    await this.page.goto(this.url);
  }

  playersNumber = this.page.getByRole("spinbutton", {
    name: PLAYERS_NUMBER,
  });
  playerName = (number: number) =>
    this.page.getByRole("textbox", { name: PLAYER_NAME(number) });
  squaresNumber = this.page.getByRole("spinbutton", {
    name: "Number of Squares:",
  });
  submit = this.page.getByRole("button", { name: "Start Game" });
}
