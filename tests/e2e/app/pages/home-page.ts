import type { Page } from "@playwright/test";
import {
  LABEL_DRAW,
  LABEL_MIME,
  LABEL_MOVE,
  LABEL_PLAYER_NAME,
  LABEL_PLAYERS_NUMBER,
  LABEL_QUIZ,
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

  // Checkbox locators
  mimeCheckbox = this.page.getByRole("checkbox", { name: LABEL_MIME });
  quizCheckbox = this.page.getByRole("checkbox", { name: LABEL_QUIZ });
  drawCheckbox = this.page.getByRole("checkbox", { name: LABEL_DRAW });
  moveCheckbox = this.page.getByRole("checkbox", { name: LABEL_MOVE });
}
