import { expect, type Page, test } from "@playwright/test";

async function seedRandom(page: Page, seed = 42) {
  await page.addInitScript((s: number) => {
    let state = s;
    Math.random = () => {
      state = (state * 1664525 + 1013904223) >>> 0;
      return state / 4294967296;
    };
  }, seed);
}

const VIEWPORT_DESKTOP = { width: 1920, height: 1080 };
const VIEWPORT_MOBILE = { width: 390, height: 844 };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeGameState(
  players: { id: number; name: string }[],
  positions: number[] = [],
  numSquares = 20,
) {
  const squareTypes = [
    "normal",
    "normal",
    "quiz",
    "normal",
    "mime",
    "normal",
    "normal",
    "backwrite",
    "normal",
    "face-emotion",
    "normal",
    "normal",
    "music-emotion",
    "normal",
    "physical-test",
    "normal",
    "what-would-you-do",
    "normal",
    "dictation-draw",
    "normal",
  ];

  return {
    board: {
      squares: Array.from({ length: numSquares }, (_, i) => ({
        number: i,
        type:
          i === 0 || i === numSquares - 1
            ? "normal"
            : (squareTypes[i] ?? "normal"),
      })),
      playersPosition: players.map((p, idx) => ({
        playerId: p.id,
        position: positions[idx] ?? 0,
      })),
    },
    players: players.map((p) => ({
      id: p.id,
      name: p.name,
      turnsToSkip: 0,
    })),
    currentTurn: 0,
    currentRound: 3,
    gameEnded: false,
  };
}

function baseSession(
  sessionId: string,
  overrides: Record<string, unknown> = {},
) {
  return {
    sessionId,
    players: [] as { id: string; name: string }[],
    started: false,
    gameState: null,
    currentPlayerId: null,
    pendingAction: null,
    diceResult: null,
    lastMoveInfo: null,
    gameOver: null,
    updatedAt: Date.now(),
    createdAt: Date.now(),
    ...overrides,
  };
}

async function mockSession(
  page: Page,
  sessionId: string,
  data: Record<string, unknown>,
) {
  await page.route(`**/api/sessions/${sessionId}**`, async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({ json: data });
    } else {
      await route.continue();
    }
  });
}

// ---------------------------------------------------------------------------
// Mode selection — schermata home
// ---------------------------------------------------------------------------

test("screenshot-mode-selection", async ({ page }) => {
  await page.setViewportSize(VIEWPORT_DESKTOP);
  // Clear sessionStorage so the mode-selection panel is shown
  await page.addInitScript(() => sessionStorage.removeItem("gameMode"));
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: /Schermo singolo/ }),
  ).toBeVisible();
  await expect(page).toHaveScreenshot("mode-selection.png", { fullPage: true });
});

test("screenshot-home-single-filled", async ({ page }) => {
  await page.setViewportSize(VIEWPORT_DESKTOP);
  await page.addInitScript(() => sessionStorage.removeItem("gameMode"));
  await page.goto("/");
  await page.getByRole("button", { name: /Schermo singolo/ }).click();
  // Fill in some player names for a realistic screenshot
  await page.getByLabel("Numero di giocatori:").clear();
  await page.getByLabel("Numero di giocatori:").pressSequentially("3");
  await page.getByLabel("Nome giocatore 1:").pressSequentially("Alice");
  await page.getByLabel("Nome giocatore 2:").pressSequentially("Bob");
  await page.getByLabel("Nome giocatore 3:").pressSequentially("Carol");
  await expect(page).toHaveScreenshot("home-single-filled.png", {
    fullPage: true,
  });
});

test("screenshot-home-multi-config", async ({ page }) => {
  await page.setViewportSize(VIEWPORT_DESKTOP);
  await page.addInitScript(() => sessionStorage.removeItem("gameMode"));
  await page.goto("/");
  await page.getByRole("button", { name: /Multi-dispositivo/ }).click();
  await expect(page.getByText("Configura il tabellone")).toBeVisible();
  await expect(page).toHaveScreenshot("home-multi-config.png", {
    fullPage: true,
  });
});

// ---------------------------------------------------------------------------
// Multiplayer lobby — host
// ---------------------------------------------------------------------------

test("screenshot-multiplayer-lobby-empty", async ({ page }) => {
  await page.setViewportSize(VIEWPORT_DESKTOP);
  await page.addInitScript(() => localStorage.setItem("hostToken", "host-tok"));
  await seedRandom(page);
  await mockSession(page, "LOBBY0", baseSession("LOBBY0", { players: [] }));

  await page.goto("/multiplayer/LOBBY0");
  await expect(page.getByText("In attesa dei giocatori...")).toBeVisible();
  await expect(page).toHaveScreenshot("multiplayer-lobby-empty.png", {
    fullPage: true,
  });
});

test("screenshot-multiplayer-lobby", async ({ page }) => {
  await page.setViewportSize(VIEWPORT_DESKTOP);
  await page.addInitScript(() => localStorage.setItem("hostToken", "host-tok"));
  await seedRandom(page);
  await mockSession(
    page,
    "LOBBY1",
    baseSession("LOBBY1", {
      players: [
        { id: "0", name: "Alice" },
        { id: "1", name: "Bob" },
        { id: "2", name: "Carol" },
      ],
    }),
  );

  await page.goto("/multiplayer/LOBBY1");
  await expect(page.getByText("Alice")).toBeVisible();
  await expect(page).toHaveScreenshot("multiplayer-lobby.png", {
    fullPage: true,
  });
});

// ---------------------------------------------------------------------------
// Multiplayer host — board durante la partita
// ---------------------------------------------------------------------------

test("screenshot-multiplayer-board", async ({ page }) => {
  await page.setViewportSize(VIEWPORT_DESKTOP);
  await page.addInitScript(() => localStorage.setItem("hostToken", "host-tok"));

  const gameState = makeGameState(
    [
      { id: 0, name: "Alice" },
      { id: 1, name: "Bob" },
      { id: 2, name: "Carol" },
    ],
    [7, 4, 11],
  );

  await seedRandom(page);
  await mockSession(
    page,
    "GAME01",
    baseSession("GAME01", {
      players: [
        { id: "0", name: "Alice" },
        { id: "1", name: "Bob" },
        { id: "2", name: "Carol" },
      ],
      started: true,
      gameState,
      currentPlayerId: "0",
    }),
  );

  await page.goto("/multiplayer/GAME01");
  // Wait for board to render
  await page
    .waitForSelector("[data-testid='board'], .board, table", { timeout: 5000 })
    .catch(() => {});
  // Wait for Alice in the sidebar
  await expect(page.getByText("Alice").first()).toBeVisible();
  await expect(page).toHaveScreenshot("multiplayer-board.png", {
    fullPage: true,
  });
});

// ---------------------------------------------------------------------------
// Multiplayer host — azione quiz in corso
// ---------------------------------------------------------------------------

test("screenshot-multiplayer-quiz-host", async ({ page }) => {
  await page.setViewportSize(VIEWPORT_DESKTOP);
  await page.addInitScript(() => localStorage.setItem("hostToken", "host-tok"));

  const gameState = makeGameState(
    [
      { id: 0, name: "Alice" },
      { id: 1, name: "Bob" },
    ],
    [3, 1],
  );

  await seedRandom(page);
  await mockSession(
    page,
    "QUIZ01",
    baseSession("QUIZ01", {
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
          cardTitle: "Cosa si intende per empatia?",
          cardText:
            "La capacità di comprendere e condividere i sentimenti altrui.",
        },
        actorPlayerId: "0",
        targetPlayerId: null,
      },
    }),
  );

  await page.goto("/multiplayer/QUIZ01");
  await expect(page.getByText("Cosa si intende per empatia?")).toBeVisible();
  await expect(page).toHaveScreenshot("multiplayer-quiz-host.png", {
    fullPage: true,
  });
});

test("screenshot-multiplayer-quiz-host-answer", async ({ page }) => {
  await page.setViewportSize(VIEWPORT_DESKTOP);
  await page.addInitScript(() => localStorage.setItem("hostToken", "host-tok"));

  const gameState = makeGameState(
    [
      { id: 0, name: "Alice" },
      { id: 1, name: "Bob" },
    ],
    [3, 1],
  );

  await seedRandom(page);
  await mockSession(
    page,
    "QUIZ02",
    baseSession("QUIZ02", {
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
          cardTitle: "Cosa si intende per empatia?",
          cardText:
            "La capacità di comprendere e condividere i sentimenti altrui.",
        },
        actorPlayerId: "0",
        targetPlayerId: null,
      },
    }),
  );

  await page.goto("/multiplayer/QUIZ02");
  await expect(page.getByText("Cosa si intende per empatia?")).toBeVisible();
  await page
    .getByRole("button", { name: /Mostra risposta|Mostra soluzione/ })
    .click();
  await expect(
    page.getByText(
      "La capacità di comprendere e condividere i sentimenti altrui.",
    ),
  ).toBeVisible();
  await expect(page).toHaveScreenshot("multiplayer-quiz-host-answer.png", {
    fullPage: true,
  });
});

// ---------------------------------------------------------------------------
// Multiplayer host — azione mimo in corso
// ---------------------------------------------------------------------------

test("screenshot-multiplayer-mime-host", async ({ page }) => {
  await page.setViewportSize(VIEWPORT_DESKTOP);
  await page.addInitScript(() => localStorage.setItem("hostToken", "host-tok"));

  const gameState = makeGameState(
    [
      { id: 0, name: "Alice" },
      { id: 1, name: "Bob" },
    ],
    [2, 5],
  );

  await seedRandom(page);
  await mockSession(
    page,
    "MIME01",
    baseSession("MIME01", {
      players: [
        { id: "0", name: "Alice" },
        { id: "1", name: "Bob" },
      ],
      started: true,
      gameState,
      currentPlayerId: "0",
      pendingAction: {
        type: "mime",
        card: {
          cardTitle: "Mimo",
          cardText: "Fare una passeggiata sotto la pioggia",
        },
        actorPlayerId: "0",
        targetPlayerId: null,
      },
    }),
  );

  await page.goto("/multiplayer/MIME01");
  await expect(page.getByText("Alice").first()).toBeVisible();
  await expect(page).toHaveScreenshot("multiplayer-mime-host.png", {
    fullPage: true,
  });
});

// ---------------------------------------------------------------------------
// Join page
// ---------------------------------------------------------------------------

test("screenshot-multiplayer-join", async ({ page }) => {
  await page.setViewportSize(VIEWPORT_MOBILE);
  await page.goto("/join/ABC123");
  await expect(page.getByLabel("Il tuo nome")).toBeVisible();
  await expect(page).toHaveScreenshot("multiplayer-join.png", {
    fullPage: true,
  });
});

// ---------------------------------------------------------------------------
// Player page — mobile viewport
// ---------------------------------------------------------------------------

test("screenshot-player-waiting", async ({ page }) => {
  await page.setViewportSize(VIEWPORT_MOBILE);
  await seedRandom(page);
  await mockSession(
    page,
    "WAIT01",
    baseSession("WAIT01", {
      players: [
        { id: "0", name: "Alice" },
        { id: "1", name: "Bob" },
      ],
    }),
  );

  await page.goto("/player/WAIT01/0");
  await expect(
    page.getByText(/In attesa che l'host avvii la partita/),
  ).toBeVisible();
  await expect(page).toHaveScreenshot("player-waiting.png", { fullPage: true });
});

test("screenshot-player-active-turn", async ({ page }) => {
  await page.setViewportSize(VIEWPORT_MOBILE);

  const gameState = makeGameState(
    [
      { id: 0, name: "Alice" },
      { id: 1, name: "Bob" },
    ],
    [4, 2],
  );

  await seedRandom(page);
  await mockSession(
    page,
    "TURN01",
    baseSession("TURN01", {
      players: [
        { id: "0", name: "Alice" },
        { id: "1", name: "Bob" },
      ],
      started: true,
      gameState,
      currentPlayerId: "0",
    }),
  );

  await page.goto("/player/TURN01/0");
  await expect(
    page.getByRole("button", { name: "Lancia il dado" }),
  ).toBeVisible();
  await expect(page).toHaveScreenshot("player-active-turn.png", {
    fullPage: true,
  });
});

test("screenshot-player-waiting-turn", async ({ page }) => {
  await page.setViewportSize(VIEWPORT_MOBILE);

  const gameState = makeGameState(
    [
      { id: 0, name: "Alice" },
      { id: 1, name: "Bob" },
    ],
    [4, 2],
  );

  await seedRandom(page);
  await mockSession(
    page,
    "TURN02",
    baseSession("TURN02", {
      players: [
        { id: "0", name: "Alice" },
        { id: "1", name: "Bob" },
      ],
      started: true,
      gameState,
      currentPlayerId: "1",
    }),
  );

  await page.goto("/player/TURN02/0");
  // Alice is waiting — it's Bob's turn
  await expect(page.getByText(/Turno di/)).toBeVisible();
  await expect(page).toHaveScreenshot("player-waiting-turn.png", {
    fullPage: true,
  });
});

test("screenshot-player-quiz-action", async ({ page }) => {
  await page.setViewportSize(VIEWPORT_MOBILE);

  const gameState = makeGameState(
    [
      { id: 0, name: "Alice" },
      { id: 1, name: "Bob" },
    ],
    [3, 1],
  );

  await seedRandom(page);
  await mockSession(
    page,
    "PQUIZ1",
    baseSession("PQUIZ1", {
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
          cardTitle: "Cosa si intende per empatia?",
          cardText:
            "La capacità di comprendere e condividere i sentimenti altrui.",
        },
        actorPlayerId: "0",
        targetPlayerId: null,
      },
    }),
  );

  await page.goto("/player/PQUIZ1/0");
  await expect(page.getByText("Cosa si intende per empatia?")).toBeVisible();
  await expect(page).toHaveScreenshot("player-quiz-action.png", {
    fullPage: true,
  });
});

test("screenshot-player-game-over", async ({ page }) => {
  await page.setViewportSize(VIEWPORT_MOBILE);

  await seedRandom(page);
  await mockSession(
    page,
    "OVER01",
    baseSession("OVER01", {
      players: [
        { id: "0", name: "Alice" },
        { id: "1", name: "Bob" },
      ],
      started: true,
      gameState: null,
      gameOver: { winnerName: "Alice" },
    }),
  );

  await page.goto("/player/OVER01/1");
  await expect(page.getByText("Fine partita!")).toBeVisible();
  await expect(page).toHaveScreenshot("player-game-over.png", {
    fullPage: true,
  });
});
