import type { Page } from "@playwright/test";
import {
  DICE_BUTTON_CONTINUE,
  DICE_BUTTON_ROLL,
  DICE_BUTTON_SKIP_TURN,
  DICE_SKIP_TURN_MESSAGE,
  LEFT_BAR_PLAY_TURN,
  MODAL_TITLE_TURN_RESULT,
} from "@/app/texts";

export class GamePage {
  constructor(readonly page: Page) {}

  url = "/game";

  async goto() {
    await this.page.goto(this.url);
    await this.playTurnButton.waitFor();
  }

  // Left bar elements
  playTurnButton = this.page.getByRole("button", { name: LEFT_BAR_PLAY_TURN });

  // Dice roll elements
  rollDiceButton = this.page.getByRole("button", { name: DICE_BUTTON_ROLL });
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
}
