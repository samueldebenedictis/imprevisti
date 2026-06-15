# Docs Index — La Città degli Imprevisti

Each file is self-contained for its domain.

## Files

| File | When to use |
|------|-------------|
| [architecture.md](architecture.md) | Any task: stack, folder structure, npm commands, env vars |
| [multiplayer-api.md](multiplayer-api.md) | API routes, session store, `SessionState`/`PendingAction` types |
| [game-model.md](game-model.md) | Game engine, `Game`/`Board`/`Player` classes, serialization |
| [frontend-patterns.md](frontend-patterns.md) | Multiplayer/player pages, polling hook, `IdleOverlay`, `getCardDisplay` |
| [testing-patterns.md](testing-patterns.md) | Adding or modifying vitest or Playwright tests |

---

## Find by topic

### Project structure and npm commands
→ [architecture.md](architecture.md)

### TypeScript types (`SessionState`, `PendingAction`, `PublicSessionState`, ...)
→ [multiplayer-api.md](multiplayer-api.md) — "Key Types"
→ Source: `src/types/session.ts`

### API routes — paths, request body, response shape
→ [multiplayer-api.md](multiplayer-api.md) — "API Routes"
→ Source: `src/app/api/sessions/[id]/`

### Session store (Redis / Vercel KV / in-memory fallback)
→ [multiplayer-api.md](multiplayer-api.md) — "Session Store"
→ Source: `src/lib/session-store.ts`
→ Key exports: `getSession`, `saveSession`, `toPublicSession`

### Long polling
→ [multiplayer-api.md](multiplayer-api.md) — `GET /api/sessions/[id]?since=`
→ Source: `src/app/api/sessions/[id]/route.ts`

### Host / player authentication in routes
→ [multiplayer-api.md](multiplayer-api.md) — "Authentication Pattern"

### Full turn flow
→ [multiplayer-api.md](multiplayer-api.md) — "Full Turn Flow"

### Game classes (Game, Board, Player, Square)
→ [game-model.md](game-model.md)
→ Source: `src/model/`

### Game state serialization (toJSON / fromJSON)
→ [game-model.md](game-model.md) — "Serialization"

### Player ID type conversion (number ↔ string)
→ [game-model.md](game-model.md) — "Player"
→ Pattern: `String(player.getId())` / `Number(sessionPlayer.id)`

### Client-side polling hook
→ [frontend-patterns.md](frontend-patterns.md) — "useSessionPolling"
→ Source: `src/lib/use-session-polling.ts`

### Inactivity overlay
→ [frontend-patterns.md](frontend-patterns.md) — "IdleOverlay"
→ Source: `src/app/components/idle-overlay.tsx`

### Extract display data from `PendingAction.card`
→ [frontend-patterns.md](frontend-patterns.md) — "getCardDisplay"
→ Source: `src/lib/card-utils.ts`

### Async fetch inside useEffect (cancelled flag pattern)
→ [frontend-patterns.md](frontend-patterns.md) — "Pattern: cancelled flag"

### Prevent double-submit on buttons
→ [frontend-patterns.md](frontend-patterns.md) — "Pattern: isResolving"

### Shared UI components (Button, Input, ...)
→ [frontend-patterns.md](frontend-patterns.md) — "Shared UI Components"
→ Source: `src/app/components/ui/`

### Writing vitest tests for API routes
→ [testing-patterns.md](testing-patterns.md) — "Mandatory Setup" and "vi.mock with importOriginal"

### Why importOriginal is required in mocks
→ [testing-patterns.md](testing-patterns.md) — "vi.mock with importOriginal"

### Next.js 15 params pattern in tests
→ [testing-patterns.md](testing-patterns.md) — "Next.js 15 params pattern"

### Mocking API routes in Playwright (no real Redis)
→ [testing-patterns.md](testing-patterns.md) — "Mock API with page.route()"

### Common test errors
→ [testing-patterns.md](testing-patterns.md) — "Common Gotchas"

---

## Key source files (quick reference)

```
src/types/session.ts                           # all multiplayer types
src/lib/session-store.ts                       # session storage
src/lib/use-session-polling.ts                 # polling hook + idle detection
src/lib/card-utils.ts                          # getCardDisplay
src/app/components/idle-overlay.tsx            # inactivity overlay
src/app/api/sessions/[id]/route.ts             # GET + long polling
src/app/api/sessions/[id]/action/route.ts      # action resolution
src/app/api/sessions/[id]/roll/route.ts        # dice roll
src/app/multiplayer/[sessionId]/page.tsx       # host page
src/app/player/[sessionId]/[playerId]/page.tsx # player page
src/model/game.ts                              # game engine
```
