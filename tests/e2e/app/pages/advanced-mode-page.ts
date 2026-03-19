import type { Page } from "@playwright/test";
import {
  LABEL_ADVANCED_MODE,
  LABEL_ADVANCED_MODE_APPLY,
  LABEL_ADVANCED_MODE_CANCEL,
  LABEL_ADVANCED_MODE_RESET,
} from "@/app/texts";

export class AdvancedModePage {
  constructor(readonly page: Page) {}
  url = "/advanced-mode";

  async goto() {
    await this.page.goto(this.url);
  }

  title = this.page.getByRole("heading", { name: LABEL_ADVANCED_MODE });
  applyButton = this.page.getByRole("button", {
    name: LABEL_ADVANCED_MODE_APPLY,
  });
  cancelButton = this.page.getByRole("button", {
    name: LABEL_ADVANCED_MODE_CANCEL,
  });
  resetButton = this.page.getByRole("button", {
    name: LABEL_ADVANCED_MODE_RESET,
  });

  /**
   * Selettore del tipo di casella per l'indice dato (1 = prima casella editabile).
   * La casella 0 (START) è bloccata, quindi squareIndex=1 corrisponde al primo <select>.
   */
  squareTypeSelect = (squareIndex: number) =>
    this.page.locator("select").nth(squareIndex - 1);

  /** Input del valore di movimento per una casella di tipo "move". */
  moveValueInput = (squareIndex: number) =>
    this.page.locator(`#mv-${squareIndex}`);
}
