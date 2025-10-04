import { expect, type Page } from "@playwright/test";
import {
  LABEL_BACKWRITE,
  LABEL_DICTATION_DRAW,
  LABEL_FACE_EMOTION,
  LABEL_MIME,
  LABEL_MOVE,
  LABEL_MUSIC_EMOTION,
  LABEL_PHYSICAL_TEST,
  LABEL_PLAYER_NAME,
  LABEL_PLAYERS_NUMBER,
  LABEL_QUIZ,
  LABEL_SQUARES_NUMBER,
  LABEL_SUBMIT,
  LABEL_WHAT_WOULD_YOU_DO,
} from "@/app/texts";
import { GamePage } from "./game-page";

export class HomePage {
  constructor(readonly page: Page) {}
  url = "/";

  async goto() {
    await this.page.goto(this.url);
  }

  async submitAndGotoGame() {
    await this.submit.click();
    const homePage = new GamePage(this.page);
    await expect(homePage.page).toHaveURL(/game/);
    return homePage;
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
  backwriteCheckbox = this.page.getByRole("checkbox", {
    name: LABEL_BACKWRITE,
  });
  moveCheckbox = this.page.getByRole("checkbox", { name: LABEL_MOVE });
  musicEmotionCheckbox = this.page.getByRole("checkbox", {
    name: LABEL_MUSIC_EMOTION,
  });
  physicalTestCheckbox = this.page.getByRole("checkbox", {
    name: LABEL_PHYSICAL_TEST,
  });
  whatWouldYouDoCheckbox = this.page.getByRole("checkbox", {
    name: LABEL_WHAT_WOULD_YOU_DO,
  });
  dictationDrawCheckbox = this.page.getByRole("checkbox", {
    name: LABEL_DICTATION_DRAW,
  });
  faceEmotionsCheckbox = this.page.getByRole("checkbox", {
    name: LABEL_FACE_EMOTION,
  });
}
