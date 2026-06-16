import type { Locator, Page } from "@playwright/test";

export class MultiplayerHostPage {
  readonly page: Page;

  // Lobby
  /** Button to start the game — label includes player count, e.g. "Inizia (2 giocatori)" */
  readonly startButton: Locator;
  /** Text showing the session ID code */
  readonly sessionCode: Locator;

  // In-game pending-action overlay
  /** Reveals the hidden answer/solution for quiz, backwrite, mime */
  readonly showAnswerButton: Locator;
  /** Marks the pending action as successful */
  readonly resolveSuccessButton: Locator;
  /** Marks the pending action as failed */
  readonly resolveFailButton: Locator;

  // Game over
  readonly gameOverTitle: Locator;

  constructor(page: Page) {
    this.page = page;
    // The start button text is "Inizia (N giocatori)"
    this.startButton = page.getByRole("button", { name: /Inizia/ });
    // Session code is shown inside a <strong> inside "Sessione: ABC123"
    this.sessionCode = page.getByText(/Sessione:/);
    this.showAnswerButton = page.getByRole("button", {
      name: /Mostra risposta|Mostra soluzione/,
    });
    this.resolveSuccessButton = page.getByRole("button", {
      name: "Riuscito",
      exact: true,
    });
    this.resolveFailButton = page.getByRole("button", { name: "Non riuscito" });
    this.gameOverTitle = page.getByText("Fine partita!");
  }

  async goto(sessionId: string) {
    await this.page.goto(`/multiplayer/${sessionId}`);
  }

  /** Returns a locator for a battle-winner button identified by player name */
  winnerButton(name: string): Locator {
    return this.page.getByRole("button", { name });
  }
}

export class MultiplayerPlayerPage {
  readonly page: Page;

  readonly rollDiceButton: Locator;
  readonly waitingMessage: Locator;
  readonly myTurnMessage: Locator;
  readonly gameOverTitle: Locator;

  constructor(page: Page) {
    this.page = page;
    this.rollDiceButton = page.getByRole("button", { name: "Lancia il dado" });
    this.waitingMessage = page.getByText(
      /In attesa che l'host avvii la partita/,
    );
    this.myTurnMessage = page.getByText("È il tuo turno!");
    this.gameOverTitle = page.getByText("Fine partita!");
  }

  async goto(sessionId: string, playerId: string) {
    await this.page.goto(`/player/${sessionId}/${playerId}`);
  }
}

export class JoinPage {
  readonly page: Page;

  readonly playerNameInput: Locator;
  readonly joinButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.playerNameInput = page.getByLabel("Il tuo nome");
    this.joinButton = page.getByRole("button", { name: "Entra nel gioco" });
  }

  async goto(sessionId: string) {
    await this.page.goto(`/join/${sessionId}`);
  }
}
