# Architecture — La Città degli Imprevisti

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| State management | Zustand (persisted to localStorage) |
| Styling | Tailwind CSS |
| Linter / formatter | Biome |
| Unit tests | Vitest |
| E2E tests | Playwright |
| UI components | Storybook |
| Git hooks | Husky |
| Session storage (prod) | Vercel KV (REST API) |
| Session storage (dev) | Redis via ioredis + Docker Compose |
| Session storage (fallback) | In-memory `Map` |

## `src/` structure

```
src/
├── app/                        # Next.js App Router
│   ├── api/                    # Server-side API routes
│   │   ├── sessions/           # Multiplayer session management
│   │   └── feedback/           # Feedback collection
│   ├── components/             # Shared React components
│   │   ├── ui/                 # Button, Input, Label, Select
│   │   └── turn-result-modal/  # Per-action-type modal variants
│   ├── game/                   # Single-screen game page
│   ├── multiplayer/            # Host: lobby + multi-device board
│   ├── player/                 # Per-player mobile screen
│   ├── join/                   # QR code redirect
│   ├── instructions/           # Game rules
│   ├── advanced-mode/          # Custom square configuration
│   ├── restore-game/           # Load saved game
│   └── feedback/               # Feedback form
├── lib/                        # Shared libraries
│   ├── session-store.ts        # Three-tier session storage
│   ├── use-session-polling.ts  # Long polling hook + idle detection
│   └── card-utils.ts           # Extract display data from PendingAction.card
├── model/                      # Game engine (pure logic, no UI/network)
│   ├── game.ts
│   ├── board.ts
│   ├── player.ts
│   ├── dice.ts
│   ├── battle.ts
│   ├── managers/               # 15 action resolvers
│   ├── deck/                   # 9 card decks
│   └── square/                 # 9 square types
├── store/                      # Zustand stores
│   ├── game-store.ts           # Single-player game state
│   ├── config-store.ts         # Game configuration
│   └── sound-store.ts          # Audio toggle
├── types/
│   └── session.ts              # SessionState, PendingAction, etc.
└── utils/
    ├── generate-squares.ts     # Board generation algorithm
    ├── game-storage.ts         # localStorage persistence (single-player)
    └── sound-manager.ts        # Web Audio API wrapper
```

## Game modes

### Single-screen (`/game`)
All players share one device. State managed entirely by Zustand in localStorage. No network.

### Multi-device (`/multiplayer/[sessionId]` + `/player/[sessionId]/[playerId]`)
Host on main screen, each player on their own smartphone. Server-side state via Redis. Long polling for sync. See [multiplayer-api.md](multiplayer-api.md).

## npm scripts

```bash
npm run dev          # Dev server on port 3000
npm run build        # Production build
npm run start        # Run production build
npm run biome        # Lint + format (--write --unsafe)
npm run lint         # Lint with autofix only
npm run format       # Format only
npm test             # Unit tests (vitest)
npm run coverage     # Unit tests with coverage report
npm run e2e:app      # Playwright E2E for the app
npm run e2e:storybook # Playwright E2E for Storybook
npm run storybook    # Storybook dev on port 6006
```

## Environment variables

| Variable | Where | Description |
|----------|-------|-------------|
| `REDIS_URL` | `.env.local` | Local Redis (`redis://localhost:6379`) |
| `KV_REST_API_URL` | Vercel | Vercel KV REST endpoint (auto-injected) |
| `KV_REST_API_TOKEN` | Vercel | Vercel KV token (auto-injected) |
| `FEEDBACK_SECRET` | `.env.local` / Vercel | Secret for `GET /api/feedback?secret=` |

Copy `.env.dist` → `.env.local` and fill in values. Redis is optional: without it, multiplayer uses the in-memory fallback (not persistent across restarts).

## Local setup with Docker

```bash
docker compose up -d   # starts Redis on port 6379
# .env.local: REDIS_URL=redis://localhost:6379
npm run dev
```
