# Testing Patterns — La Città degli Imprevisti

## Test structure

```
tests/
├── vitest/
│   ├── *.test.ts               # Game model unit tests
│   └── multiplayer/
│       ├── sessions-route.test.ts        # POST /api/sessions
│       ├── join-roll-start-route.test.ts # join, roll, start routes
│       ├── action-route.test.ts          # POST /api/sessions/[id]/action
│       └── session-store.test.ts         # session store logic
└── e2e/
    └── app/
        ├── *.spec.ts           # App E2E tests
        ├── pages/              # Page object models
        ├── fixtures.ts         # Playwright fixtures
        └── zustand.ts          # Zustand store helpers
```

---

## Vitest — API Routes

### Mandatory setup

```ts
// @vitest-environment node
```

Must be the **first line** of the file. Overrides jsdom default → enables `Request` and `Response` globals (required for Next.js API routes).

### vi.mock with importOriginal

**Rule**: when mocking a module that exports more functions than you want to replace, always use `importOriginal`.

```ts
vi.mock("@/lib/session-store", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/session-store")>();
  return {
    ...actual,               // preserves toPublicSession, deleteSession, etc.
    getSession: vi.fn(),     // replaces only these two
    saveSession: vi.fn(),
  };
});
```

**Why**: a total mock `() => ({ getSession: vi.fn(), saveSession: vi.fn() })` does not export `toPublicSession`. Routes call it → `TypeError` at runtime → all tests fail with a misleading error.

### Import order

```ts
vi.mock("@/lib/session-store", async (importOriginal) => { ... });

// Imports go AFTER the mock (vi.mock is hoisted)
import { POST } from "@/app/api/sessions/[id]/action/route";
import * as sessionStore from "@/lib/session-store";
```

### Next.js 15 params pattern

```ts
const params = { params: Promise.resolve({ id: "TEST01" }) };

// In calls:
const res = await POST(makeReq({ ... }), params);
```

### mockSession helper

```ts
function mockSession(overrides: Partial<SessionState> = {}): SessionState {
  return {
    sessionId: "TEST01",
    hostToken: "host-tok",
    players: [
      { id: "0", name: "Alice" },
      { id: "1", name: "Bob" },
    ],
    started: true,
    gameState: makeGameState(),
    currentPlayerId: "0",
    pendingAction: null,
    diceResult: null,
    lastMoveInfo: null,
    gameOver: null,
    updatedAt: Date.now(),
    createdAt: Date.now(),
    ...overrides,
  };
}
```

### Full test file template

```ts
// @vitest-environment node
import { afterEach, describe, expect, test, vi } from "vitest";

vi.mock("@/lib/session-store", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/session-store")>();
  return { ...actual, getSession: vi.fn(), saveSession: vi.fn() };
});

import { POST } from "@/app/api/sessions/[id]/action/route";
import * as sessionStore from "@/lib/session-store";

const params = { params: Promise.resolve({ id: "TEST01" }) };

afterEach(() => { vi.clearAllMocks(); });

describe("POST /api/sessions/[id]/action", () => {
  test("403 with wrong hostToken", async () => {
    vi.mocked(sessionStore.getSession).mockResolvedValue(mockSession({ ... }));
    vi.mocked(sessionStore.saveSession).mockResolvedValue(undefined);

    const res = await POST(new Request("http://localhost/...", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hostToken: "wrong", success: true }),
    }), params);

    expect(res.status).toBe(403);
  });
});
```

---

## Playwright — E2E

### Mock API with page.route()

Avoids real Redis in E2E tests.

```ts
await page.route("/api/sessions", async (route) => {
  await route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ sessionId: "TEST01", hostToken: "tok" }),
  });
});

// Wildcard for [id] routes:
await page.route("/api/sessions/**", async (route, request) => {
  const url = request.url();
  if (url.endsWith("/join") && request.method() === "POST") {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ playerId: "0" }),
    });
  } else {
    await route.continue();
  }
});
```

### Page object models

Keeps selectors out of tests for reusability.

```ts
// tests/e2e/app/pages/multiplayer-page.ts
export class MultiplayerHostPage {
  constructor(private page: Page) {}

  async waitForLobby() {
    await this.page.waitForSelector("[data-testid='lobby']");
  }

  async startGame() {
    await this.page.click("[data-testid='start-game-btn']");
  }
}
```

### Shared fixtures

```ts
// tests/e2e/app/fixtures.ts
import { test as base } from "@playwright/test";

export const test = base.extend<{ gamePage: GamePage }>({
  gamePage: async ({ page }, use) => {
    await use(new GamePage(page));
  },
});
```

### Zustand helpers

`tests/e2e/app/zustand.ts` — lets Playwright tests read/write Zustand store state directly from the outside.

---

## Commands

```bash
npm test                          # unit tests (watch mode)
npm run coverage                  # unit tests + coverage report
npm run e2e:app                   # E2E app tests (headless)
npx playwright test --ui          # E2E with Playwright UI
npx playwright test -g "test name" # filter by name
```

---

## Common Gotchas

| Error | Cause | Fix |
|-------|-------|-----|
| `ReferenceError: Request is not defined` | Missing `// @vitest-environment node` | Add as first line |
| `TypeError: toPublicSession is not a function` | Total mock without `importOriginal` | Use `importOriginal` pattern |
| Test passes but route returns 500 | `getSession` mock not set → returns `undefined` | `mockResolvedValue(mockSession(...))` |
| `params.id` is `undefined` | `params` not passed or not awaited in route | Use `{ params: Promise.resolve({ id: "..." }) }` |
| All tests in a file fail with same error | `vi.mock` import order wrong | Import route/store after `vi.mock` call |
