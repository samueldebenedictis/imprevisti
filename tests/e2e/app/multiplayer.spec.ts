import { expect, test } from "@playwright/test";
import {
  JoinPage,
  MultiplayerHostPage,
  MultiplayerPlayerPage,
} from "./pages/multiplayer-page";

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

/**
 * Minimal GameJSON payload that Game.fromJSON() can deserialise.
 * Shape mirrors GameJSON / BoardJSON / PlayerJSON from src/model/.
 */
function makeGameState(
  playerIds: { id: number; name: string }[],
  numSquares = 10,
) {
  return {
    board: {
      squares: Array.from({ length: numSquares }, (_, i) => ({
        number: i,
        type: "normal",
      })),
      playersPosition: playerIds.map((p) => ({
        playerId: p.id,
        position: 0,
      })),
    },
    players: playerIds.map((p) => ({
      id: p.id,
      name: p.name,
      turnsToSkip: 0,
    })),
    currentTurn: 0,
    currentRound: 1,
    gameEnded: false,
  };
}

// ---------------------------------------------------------------------------
// Home — mode selection
// ---------------------------------------------------------------------------

test.describe("Home — mode selection", () => {
  test("shows both mode selection buttons", async ({ page }) => {
    await page.goto("/");
    // The mode selection panel is inside a md:block wrapper — the default
    // Desktop Chrome viewport (1280×720) is wide enough for it to be visible.
    await expect(
      page.getByRole("button", { name: "Schermo singolo" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Multi-dispositivo" }),
    ).toBeVisible();
  });

  test("Multi-dispositivo hides player name fields", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Multi-dispositivo" }).click();
    // Player name inputs must not be visible in multi-device mode
    await expect(page.getByLabel("Nome giocatore 1:")).not.toBeVisible();
    // Board size input must still be present
    await expect(page.getByLabel("Numero di caselle:")).toBeVisible();
  });

  test("Schermo singolo shows player name fields", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Schermo singolo" }).click();
    await expect(page.getByLabel("Nome giocatore 1:")).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// /multiplayer — session creation and redirect
// ---------------------------------------------------------------------------

test.describe("Multiplayer — session creation", () => {
  test("navigating to /multiplayer creates a session and redirects to lobby", async ({
    page,
  }) => {
    await page.route("**/api/sessions", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          json: { sessionId: "ABC123", hostToken: "host-tok" },
        });
      } else {
        await route.continue();
      }
    });

    await page.route("**/api/sessions/ABC123**", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          json: {
            sessionId: "ABC123",
            players: [],
            started: false,
            gameState: null,
            currentPlayerId: null,
            pendingAction: null,
            diceResult: null,
            lastMoveInfo: null,
            gameOver: null,
            updatedAt: Date.now(),
            createdAt: Date.now(),
          },
        });
      } else {
        await route.continue();
      }
    });

    await page.goto("/multiplayer");

    // Should redirect to the session lobby
    await page.waitForURL("**/multiplayer/ABC123");

    // Session code visible in lobby
    await expect(page.getByText("ABC123")).toBeVisible();

    // Start button visible (disabled because 0 players < 2)
    const hostPage = new MultiplayerHostPage(page);
    await expect(hostPage.startButton).toBeVisible();
    await expect(hostPage.startButton).toBeDisabled();
  });
});

// ---------------------------------------------------------------------------
// Multiplayer lobby
// ---------------------------------------------------------------------------

test.describe("Multiplayer lobby", () => {
  test("shows session code, player list and start button", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("hostToken", "host-tok");
    });

    await page.route("**/api/sessions/LOBBY1**", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          json: {
            sessionId: "LOBBY1",
            players: [
              { id: "0", name: "Alice" },
              { id: "1", name: "Bob" },
            ],
            started: false,
            gameState: null,
            currentPlayerId: null,
            pendingAction: null,
            diceResult: null,
            lastMoveInfo: null,
            gameOver: null,
            updatedAt: Date.now(),
            createdAt: Date.now(),
          },
        });
      } else {
        await route.continue();
      }
    });

    const hostPage = new MultiplayerHostPage(page);
    await hostPage.goto("LOBBY1");

    // Session code text is present
    await expect(page.getByText("LOBBY1")).toBeVisible();

    // Player names listed
    await expect(page.getByText("Alice")).toBeVisible();
    await expect(page.getByText("Bob")).toBeVisible();

    // Start button is enabled when playerCount >= 2
    await expect(hostPage.startButton).toBeVisible();
    await expect(hostPage.startButton).toBeEnabled();
  });

  test("lobby shows waiting message when no players have joined", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      localStorage.setItem("hostToken", "host-tok");
    });

    await page.route("**/api/sessions/EMPTY1**", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          json: {
            sessionId: "EMPTY1",
            players: [],
            started: false,
            gameState: null,
            currentPlayerId: null,
            pendingAction: null,
            diceResult: null,
            lastMoveInfo: null,
            gameOver: null,
            updatedAt: Date.now(),
            createdAt: Date.now(),
          },
        });
      } else {
        await route.continue();
      }
    });

    const hostPage = new MultiplayerHostPage(page);
    await hostPage.goto("EMPTY1");

    await expect(page.getByText("In attesa dei giocatori...")).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Join page
// ---------------------------------------------------------------------------

test.describe("Join page", () => {
  test("shows name form and redirects to player page on submit", async ({
    page,
  }) => {
    const SESSION_ID = "ABC123";
    const PLAYER_ID = "0";

    // Register general route first (lower LIFO priority)
    await page.route(`**/api/sessions/${SESSION_ID}**`, async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          json: {
            sessionId: SESSION_ID,
            players: [{ id: PLAYER_ID, name: "Carlo" }],
            started: false,
            gameState: null,
            currentPlayerId: null,
            pendingAction: null,
            diceResult: null,
            lastMoveInfo: null,
            gameOver: null,
            updatedAt: Date.now(),
            createdAt: Date.now(),
          },
        });
      } else {
        await route.continue();
      }
    });

    // Register specific join mock second (higher LIFO priority — wins over wildcard)
    await page.route(`**/api/sessions/${SESSION_ID}/join`, async (route) => {
      await route.fulfill({ json: { playerId: PLAYER_ID } });
    });

    const joinPage = new JoinPage(page);
    await joinPage.goto(SESSION_ID);

    // Form elements visible
    await expect(joinPage.playerNameInput).toBeVisible();
    await expect(joinPage.joinButton).toBeVisible();

    // Join button disabled until name is typed
    await expect(joinPage.joinButton).toBeDisabled();

    // Fill name and submit
    await joinPage.playerNameInput.fill("Carlo");
    await expect(joinPage.joinButton).toBeEnabled();
    await joinPage.joinButton.click();

    // Should redirect to player page
    await page.waitForURL(`**/player/${SESSION_ID}/${PLAYER_ID}`);
  });
});

// ---------------------------------------------------------------------------
// Player page — waiting
// ---------------------------------------------------------------------------

test.describe("Player page — waiting state", () => {
  test("shows waiting message before host starts the game", async ({
    page,
  }) => {
    const SESSION_ID = "ABC123";
    const PLAYER_ID = "0";

    await page.route(`**/api/sessions/${SESSION_ID}**`, async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          json: {
            sessionId: SESSION_ID,
            players: [{ id: PLAYER_ID, name: "Carlo" }],
            started: false,
            gameState: null,
            currentPlayerId: null,
            pendingAction: null,
            diceResult: null,
            lastMoveInfo: null,
            gameOver: null,
            updatedAt: Date.now(),
            createdAt: Date.now(),
          },
        });
      } else {
        await route.continue();
      }
    });

    const playerPage = new MultiplayerPlayerPage(page);
    await playerPage.goto(SESSION_ID, PLAYER_ID);

    await expect(playerPage.waitingMessage).toBeVisible();
    await expect(playerPage.rollDiceButton).not.toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Player page — active turn
// ---------------------------------------------------------------------------

test.describe("Player page — active turn", () => {
  test("shows roll dice button when it is the player's turn", async ({
    page,
  }) => {
    const SESSION_ID = "XYZ789";
    const PLAYER_ID = "0";
    const gameState = makeGameState([
      { id: 0, name: "Alice" },
      { id: 1, name: "Bob" },
    ]);

    await page.route(`**/api/sessions/${SESSION_ID}**`, async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          json: {
            sessionId: SESSION_ID,
            players: [
              { id: "0", name: "Alice" },
              { id: "1", name: "Bob" },
            ],
            started: true,
            gameState,
            currentPlayerId: PLAYER_ID,
            pendingAction: null,
            diceResult: null,
            lastMoveInfo: null,
            gameOver: null,
            updatedAt: Date.now(),
            createdAt: Date.now(),
          },
        });
      } else {
        await route.continue();
      }
    });

    const playerPage = new MultiplayerPlayerPage(page);
    await playerPage.goto(SESSION_ID, PLAYER_ID);

    await expect(playerPage.myTurnMessage).toBeVisible();
    await expect(playerPage.rollDiceButton).toBeVisible();
  });

  test("shows whose turn it is when waiting for another player", async ({
    page,
  }) => {
    const SESSION_ID = "XYZ789";
    const MY_PLAYER_ID = "1";
    const CURRENT_PLAYER_ID = "0";
    const gameState = makeGameState([
      { id: 0, name: "Alice" },
      { id: 1, name: "Bob" },
    ]);

    await page.route(`**/api/sessions/${SESSION_ID}**`, async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          json: {
            sessionId: SESSION_ID,
            players: [
              { id: "0", name: "Alice" },
              { id: "1", name: "Bob" },
            ],
            started: true,
            gameState,
            currentPlayerId: CURRENT_PLAYER_ID,
            pendingAction: null,
            diceResult: null,
            lastMoveInfo: null,
            gameOver: null,
            updatedAt: Date.now(),
            createdAt: Date.now(),
          },
        });
      } else {
        await route.continue();
      }
    });

    const playerPage = new MultiplayerPlayerPage(page);
    await playerPage.goto(SESSION_ID, MY_PLAYER_ID);

    // Should show whose turn it is
    await expect(page.getByText(/Turno di/)).toBeVisible();
    await expect(page.getByText("Alice")).toHaveCount(2); // turno + lista posizioni
    await expect(playerPage.rollDiceButton).not.toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Host page — quiz pending action
// ---------------------------------------------------------------------------

test.describe("Host page — quiz pending action", () => {
  test("shows Mostra risposta, then reveals answer and success/fail buttons", async ({
    page,
  }) => {
    const SESSION_ID = "QUIZ01";
    const gameState = makeGameState([
      { id: 0, name: "Alice" },
      { id: 1, name: "Bob" },
    ]);

    await page.addInitScript(() => {
      localStorage.setItem("hostToken", "host-tok");
    });

    await page.route(`**/api/sessions/${SESSION_ID}**`, async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          json: {
            sessionId: SESSION_ID,
            players: [
              { id: "0", name: "Alice" },
              { id: "1", name: "Bob" },
            ],
            started: true,
            gameState,
            currentPlayerId: "0",
            pendingAction: {
              type: "quiz",
              card: {
                cardTitle: "Domanda di prova?",
                cardText: "Risposta corretta",
              },
              actorPlayerId: "0",
              targetPlayerId: null,
            },
            diceResult: null,
            lastMoveInfo: null,
            gameOver: null,
            updatedAt: Date.now(),
            createdAt: Date.now(),
          },
        });
      } else {
        await route.continue();
      }
    });

    const hostPage = new MultiplayerHostPage(page);
    await hostPage.goto(SESSION_ID);

    // Quiz question must be visible (cardTitle is shown as the question)
    await expect(page.getByText("Domanda di prova?")).toBeVisible();

    // Answer is hidden — "Mostra risposta" button present, answer text not yet visible
    await expect(hostPage.showAnswerButton).toBeVisible();
    await expect(page.getByText("Risposta corretta")).not.toBeVisible();

    // Click to reveal the answer
    await hostPage.showAnswerButton.click();

    // Answer is now visible
    await expect(page.getByText("Risposta corretta")).toBeVisible();

    // Resolve buttons appear after revealing answer
    await expect(hostPage.resolveSuccessButton).toBeVisible();
    await expect(hostPage.resolveFailButton).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Host page — battle pending action
// ---------------------------------------------------------------------------

test.describe("Host page — battle pending action", () => {
  test("shows player buttons to pick the battle winner", async ({ page }) => {
    const SESSION_ID = "BATT01";
    const gameState = makeGameState([
      { id: 0, name: "Alice" },
      { id: 1, name: "Bob" },
    ]);

    await page.addInitScript(() => {
      localStorage.setItem("hostToken", "host-tok");
    });

    await page.route(`**/api/sessions/${SESSION_ID}**`, async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          json: {
            sessionId: SESSION_ID,
            players: [
              { id: "0", name: "Alice" },
              { id: "1", name: "Bob" },
            ],
            started: true,
            gameState,
            currentPlayerId: "0",
            pendingAction: {
              type: "battle",
              card: null,
              actorPlayerId: "0",
              targetPlayerId: "1",
            },
            diceResult: null,
            lastMoveInfo: null,
            gameOver: null,
            updatedAt: Date.now(),
            createdAt: Date.now(),
          },
        });
      } else {
        await route.continue();
      }
    });

    const hostPage = new MultiplayerHostPage(page);
    await hostPage.goto(SESSION_ID);

    // Battle overlay title
    await expect(page.getByText("Battaglia!")).toBeVisible();

    // Both player names appear as winner-selection buttons
    await expect(hostPage.winnerButton("Alice")).toBeVisible();
    await expect(hostPage.winnerButton("Bob")).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Host page — game over
// ---------------------------------------------------------------------------

test.describe("Host page — game over", () => {
  test("shows game over screen with winner name", async ({ page }) => {
    const SESSION_ID = "OVER01";

    await page.addInitScript(() => {
      localStorage.setItem("hostToken", "host-tok");
    });

    await page.route(`**/api/sessions/${SESSION_ID}**`, async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          json: {
            sessionId: SESSION_ID,
            players: [{ id: "0", name: "Alice" }],
            started: true,
            gameState: null,
            currentPlayerId: null,
            pendingAction: null,
            diceResult: null,
            lastMoveInfo: null,
            gameOver: { winnerName: "Alice" },
            updatedAt: Date.now(),
            createdAt: Date.now(),
          },
        });
      } else {
        await route.continue();
      }
    });

    const hostPage = new MultiplayerHostPage(page);
    await hostPage.goto(SESSION_ID);

    await expect(hostPage.gameOverTitle).toBeVisible();
    await expect(page.getByText("Alice").first()).toBeVisible(); // Alice in overlay + sidebar
    await expect(
      page.getByRole("link", { name: "Torna alla home" }),
    ).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Player page — game over
// ---------------------------------------------------------------------------

test.describe("Player page — game over", () => {
  test("shows game over screen with winner name", async ({ page }) => {
    const SESSION_ID = "OVER02";
    const PLAYER_ID = "0";

    await page.route(`**/api/sessions/${SESSION_ID}**`, async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          json: {
            sessionId: SESSION_ID,
            players: [
              { id: "0", name: "Alice" },
              { id: "1", name: "Bob" },
            ],
            started: true,
            gameState: null,
            currentPlayerId: null,
            pendingAction: null,
            diceResult: null,
            lastMoveInfo: null,
            gameOver: { winnerName: "Alice" },
            updatedAt: Date.now(),
            createdAt: Date.now(),
          },
        });
      } else {
        await route.continue();
      }
    });

    const playerPage = new MultiplayerPlayerPage(page);
    await playerPage.goto(SESSION_ID, PLAYER_ID);

    await expect(playerPage.gameOverTitle).toBeVisible();
    // "Vince: Alice" — the name appears inside a <strong> within the paragraph
    await expect(page.getByText("Alice")).toBeVisible();
  });
});
