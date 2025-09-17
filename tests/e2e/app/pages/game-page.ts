import type { Page } from "@playwright/test";
import {
  DICE_BUTTON_CONTINUE,
  DICE_BUTTON_ROLL,
  DICE_BUTTON_SKIP_TURN,
  DICE_SKIP_TURN_MESSAGE,
  LEFT_BAR_PLAY_TURN,
  MODAL_BACKWRITE_CONFIRM,
  MODAL_BACKWRITE_GUESSED,
  MODAL_BACKWRITE_NOT_GUESSED,
  MODAL_BACKWRITE_SHOW_WORD,
  MODAL_BACKWRITE_TITLE,
  MODAL_BATTLE_TITLE,
  MODAL_CLOSE_BUTTON,
  MODAL_DICTATION_DRAW_CONFIRM,
  MODAL_DICTATION_DRAW_DRAWN,
  MODAL_DICTATION_DRAW_NOT_DRAWN,
  MODAL_DICTATION_DRAW_SHOW_IMAGE,
  MODAL_DICTATION_DRAW_TITLE,
  MODAL_MIME_CONFIRM,
  MODAL_MIME_GUESSED,
  MODAL_MIME_NOT_GUESSED,
  MODAL_MIME_SHOW_TOPIC,
  MODAL_MIME_TITLE,
  MODAL_MUSIC_EMOTION_GUESSED,
  MODAL_MUSIC_EMOTION_NOT_GUESSED,
  MODAL_MUSIC_EMOTION_TITLE,
  MODAL_PHYSICAL_TEST,
  MODAL_PHYSICAL_TEST_COMPLETED,
  MODAL_PHYSICAL_TEST_NOT_COMPLETED,
  MODAL_QUIZ_CORRECT,
  MODAL_QUIZ_SHOW_ANSWER,
  MODAL_QUIZ_TITLE,
  MODAL_QUIZ_WRONG,
  MODAL_TITLE_TURN_RESULT,
  MODAL_WHAT_WOULD_YOU_DO_CONVINCING_ANSWER,
  MODAL_WHAT_WOULD_YOU_DO_NOT_CONVINCING_ANSWER,
  MODAL_WHAT_WOULD_YOU_DO_TITLE,
} from "@/app/texts";

export class GamePage {
  constructor(readonly page: Page) {}

  url = "/game";

  async goto() {
    await this.page.goto(this.url);
    await this.playTurnButton.waitFor();
  }

  // Left bar elements
  playTurnButton = this.page.getByRole("button", {
    name: LEFT_BAR_PLAY_TURN,
    exact: true,
  });

  // Dice roll elements
  rollDiceButton = this.page.getByRole("button", {
    name: DICE_BUTTON_ROLL,
    exact: true,
  });
  skipTurnButton = this.page.getByRole("button", {
    name: DICE_BUTTON_SKIP_TURN,
  });
  continueButton = this.page.getByRole("button", {
    name: DICE_BUTTON_CONTINUE,
  });

  // Messages
  skipTurnMessage = (playerName: string) =>
    this.page.getByText(DICE_SKIP_TURN_MESSAGE(playerName));

  // Modal elements
  turnResultModal = this.page.getByRole("heading", {
    name: MODAL_TITLE_TURN_RESULT,
  });

  // Reusable locators for modal interactions
  playerSelectDropdown = this.page.locator("select");
  battlePlayerButtons = this.page
    .getByRole("button")
    .filter({ hasText: /^[A-Za-z]+$/ });
  playersPositionsList = this.page.locator('[id="players-position"] ul li');
  modalNewPositionText = this.page
    .getByRole("paragraph")
    .filter({ hasText: "Nuova posizione:" })
    .locator("span");

  // Modal action buttons (for manual test interactions)
  quizShowAnswerButton = this.page.getByRole("button", {
    name: MODAL_QUIZ_SHOW_ANSWER,
    exact: true,
  });
  quizCorrectButton = this.page.getByRole("button", {
    name: MODAL_QUIZ_CORRECT,
    exact: true,
  });
  quizWrongButton = this.page.getByRole("button", {
    name: MODAL_QUIZ_WRONG,
    exact: true,
  });

  mimeShowTopicButton = this.page.getByRole("button", {
    name: MODAL_MIME_SHOW_TOPIC,
    exact: true,
  });
  mimeGuessedButton = this.page.getByRole("button", {
    name: MODAL_MIME_GUESSED,
    exact: true,
  });
  mimeNotGuessedButton = this.page.getByRole("button", {
    name: MODAL_MIME_NOT_GUESSED,
    exact: true,
  });
  mimeConfirmButton = this.page.getByRole("button", {
    name: MODAL_MIME_CONFIRM,
    exact: true,
  });

  backwriteShowWordButton = this.page.getByRole("button", {
    name: MODAL_BACKWRITE_SHOW_WORD,
    exact: true,
  });
  backwriteGuessedButton = this.page.getByRole("button", {
    name: MODAL_BACKWRITE_GUESSED,
    exact: true,
  });
  backwriteNotGuessedButton = this.page.getByRole("button", {
    name: MODAL_BACKWRITE_NOT_GUESSED,
    exact: true,
  });
  backwriteConfirmButton = this.page.getByRole("button", {
    name: MODAL_BACKWRITE_CONFIRM,
    exact: true,
  });

  dictationDrawShowImageButton = this.page.getByRole("button", {
    name: MODAL_DICTATION_DRAW_SHOW_IMAGE,
    exact: true,
  });
  dictationDrawDrawnButton = this.page.getByRole("button", {
    name: MODAL_DICTATION_DRAW_DRAWN,
    exact: true,
  });
  dictationDrawNotDrawnButton = this.page.getByRole("button", {
    name: MODAL_DICTATION_DRAW_NOT_DRAWN,
    exact: true,
  });
  dictationDrawConfirmButton = this.page.getByRole("button", {
    name: MODAL_DICTATION_DRAW_CONFIRM,
    exact: true,
  });

  musicEmotionGuessedButton = this.page.getByRole("button", {
    name: MODAL_MUSIC_EMOTION_GUESSED,
    exact: true,
  });
  musicEmotionNotGuessedButton = this.page.getByRole("button", {
    name: MODAL_MUSIC_EMOTION_NOT_GUESSED,
    exact: true,
  });

  physicalTestCompletedButton = this.page.getByRole("button", {
    name: MODAL_PHYSICAL_TEST_COMPLETED,
    exact: true,
  });
  physicalTestNotCompletedButton = this.page.getByRole("button", {
    name: MODAL_PHYSICAL_TEST_NOT_COMPLETED,
    exact: true,
  });

  whatWouldYouDoConvincingButton = this.page.getByRole("button", {
    name: MODAL_WHAT_WOULD_YOU_DO_CONVINCING_ANSWER,
    exact: true,
  });
  whatWouldYouDoNotConvincingButton = this.page.getByRole("button", {
    name: MODAL_WHAT_WOULD_YOU_DO_NOT_CONVINCING_ANSWER,
    exact: true,
  });

  modalCloseButton = this.page.getByRole("button", {
    name: MODAL_CLOSE_BUTTON,
    exact: true,
  });

  // Modal title locators
  quizModalTitle = this.page.getByText(MODAL_QUIZ_TITLE);
  dictationDrawModalTitle = this.page.getByText(MODAL_DICTATION_DRAW_TITLE);
  mimeModalTitle = this.page.getByText(MODAL_MIME_TITLE);
  backwriteModalTitle = this.page.getByText(MODAL_BACKWRITE_TITLE);
  musicEmotionModalTitle = this.page.getByText(MODAL_MUSIC_EMOTION_TITLE);
  physicalTestModalTitle = this.page.getByText(MODAL_PHYSICAL_TEST);
  whatWouldYouDoModalTitle = this.page.getByText(MODAL_WHAT_WOULD_YOU_DO_TITLE);
  battleModalTitle = this.page.getByText(MODAL_BATTLE_TITLE);

  async getPlayerPosition(playerIndex: number): Promise<number> {
    const playerLocator = this.playersPositionsList.nth(playerIndex);
    const innerText = await playerLocator.innerText();

    return parseInt(innerText.split(" ")[1]) || 0;
  }

  async getPositionInModal(): Promise<number> {
    const initialPositionText = await this.modalNewPositionText.innerText();
    const initialPosition = parseInt(initialPositionText);
    return initialPosition;
  }
}
