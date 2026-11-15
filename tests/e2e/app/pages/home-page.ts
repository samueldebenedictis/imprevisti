import { expect, type Page } from "@playwright/test";
import {
  FACES_SETUP_DECLINE,
  LABEL_ADVANCED_MODE,
  LABEL_ADVANCED_MODE_ACTIVE,
  LABEL_ADVANCED_MODE_REMOVE,
  LABEL_BACKWRITE,
  LABEL_DICTATION_DRAW,
  LABEL_EMOTION_VIDEO,
  LABEL_FACE_EMOTION,
  LABEL_MIME,
  LABEL_MOVE,
  LABEL_MUSIC_EMOTION,
  LABEL_PAWN_DONE,
  LABEL_PHYSICAL_TEST,
  LABEL_PLAYER_NAME,
  LABEL_PLAYERS_NUMBER,
  LABEL_QUIZ,
  LABEL_SQUARES_NUMBER,
  LABEL_SUBMIT,
  LABEL_WHAT_WOULD_YOU_DO,
  PAWN_COLOR_NAMES,
  PAWN_SHAPE_NAMES,
} from "@/app/texts";
import type { PawnColor, PawnShape } from "@/model/pawn";
import { GamePage } from "./game-page";

export class HomePage {
  constructor(readonly page: Page) {}
  url = "/";

  async goto() {
    await this.page.goto(this.url);
  }

  singleModeButton = this.page.getByRole("button", { name: /Schermo singolo/ });

  async selectSingleMode() {
    await this.singleModeButton.click();
  }

  /** Finestra FACES all'avvio: "Gioca senza codice" (volti illustrati). */
  facesDeclineButton = this.page.getByRole("button", {
    name: FACES_SETUP_DECLINE,
  });

  /**
   * Avvia la partita. Con la sfida "Indovina l'emozione" nel tabellone
   * compare la richiesta del codice FACES: `withoutFacesCode` la chiude
   * giocando con i volti illustrati.
   */
  async submitAndGotoGame({ withoutFacesCode = false } = {}) {
    await this.submit.click();
    if (withoutFacesCode) await this.facesDeclineButton.click();
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

  /** Anteprima della pedina accanto al nome del giocatore `number` (da 1). */
  pawnButton = (number: number) =>
    this.page
      .getByRole("button", { name: /Personalizza la pedina/ })
      .nth(number - 1);
  pawnDialog = this.page.getByRole("dialog");
  pawnDone = this.pawnDialog.getByRole("button", { name: LABEL_PAWN_DONE });

  /**
   * Sceglie colore e forma della pedina del giocatore `number` nella finestra
   * che si apre cliccando l'anteprima (radio nascoste: si forza il clic).
   */
  async choosePawn(
    number: number,
    pawn: { color?: PawnColor; shape?: PawnShape },
  ) {
    await this.pawnButton(number).click();
    if (pawn.color)
      await this.pawnDialog
        .getByRole("radio", { name: PAWN_COLOR_NAMES[pawn.color], exact: true })
        .check({ force: true });
    if (pawn.shape)
      await this.pawnDialog
        .getByRole("radio", { name: PAWN_SHAPE_NAMES[pawn.shape], exact: true })
        .check({ force: true });
    await this.pawnDone.click();
  }

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
  emotionVideoCheckbox = this.page.getByRole("checkbox", {
    name: LABEL_EMOTION_VIDEO,
  });

  // Advanced mode
  advancedModeButton = this.page.getByRole("button", {
    name: LABEL_ADVANCED_MODE,
  });
  removeCustomSquaresButton = this.page.getByRole("button", {
    name: LABEL_ADVANCED_MODE_REMOVE,
  });
  advancedModeActiveText = this.page.getByText(LABEL_ADVANCED_MODE_ACTIVE);
}
