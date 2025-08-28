import type { Page } from "@playwright/test";
import {
  LABEL_PLAYER_NAME,
  LABEL_PLAYERS_NUMBER,
  LABEL_SQUARES_NUMBER,
  LABEL_SUBMIT,
} from "@/app/texts";

export class HomePage {
  constructor(readonly page: Page) {}
  url = "/";

  async goto() {
    await this.page.goto(this.url);
  }

  playersNumber = this.page.getByRole("spinbutton", {
    name: LABEL_PLAYERS_NUMBER,
  });
  playerName = (number: number) =>
    this.page.getByRole("textbox", { name: LABEL_PLAYER_NAME(number) });
  squaresNumber = this.page.getByRole("spinbutton", {
    name: LABEL_SQUARES_NUMBER,
  });
  submit = this.page.getByRole("button", { name: LABEL_SUBMIT });
}
