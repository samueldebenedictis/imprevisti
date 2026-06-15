# Multiplayer API — La Città degli Imprevisti

## Key Types (`src/types/session.ts`)

```ts
interface SessionPlayer {
  id: string;    // numeric string: "0", "1", "2", ...
  name: string;
}

interface PendingAction {
  type: string;          // 'quiz' | 'mime' | 'backwrite' | 'face-emotion' |
                         // 'music-emotion' | 'physical-test' |
                         // 'what-would-you-do' | 'dictation-draw' | 'battle'
  card: unknown;         // serialized primitive or plain object (never class instances)
  actorPlayerId: string;
  targetPlayerId?: string;
}

interface LastMoveInfo {
  actorPlayerId: string;
  diceResult: number;    // 0 = turn skipped
  squareNumber: number;
  squareType: string;
}

interface SessionState {
  sessionId: string;
  hostToken: string;                   // host-only secret — NEVER sent to clients
  players: SessionPlayer[];
  started: boolean;
  gameState: GameJSON | null;
  currentPlayerId: string | null;
  pendingAction: PendingAction | null;
  diceResult: number | null;
  lastMoveInfo: LastMoveInfo | null;
  gameOver: { winnerName: string } | null;
  createdAt: number;
  updatedAt: number;
}

type PublicSessionState = Omit<SessionState, "hostToken">;
```

## Session Store (`src/lib/session-store.ts`)

Three tiers, selected automatically based on env vars:

```
Vercel KV  (KV_REST_API_URL present)
  └─▶ ioredis  (REDIS_URL present)
        └─▶ In-memory Map  (fallback, not persistent across restarts)
```

### Exports

```ts
getSession(id: string): Promise<SessionState | null>
saveSession(id: string, state: SessionState): Promise<void>
deleteSession(id: string): Promise<void>
toPublicSession(session: SessionState): PublicSessionState  // strips hostToken
pushFeedback(entry: string): Promise<void>
getFeedback(count?: number): Promise<string[]>
```

Session TTL: `SESSION_TTL = 60 * 60 * 4` (4 hours).

The ioredis branch wraps `JSON.parse` in try-catch: corrupt data → `null`, not a 500 error.

## API Routes

### `POST /api/sessions`
Creates a new session.

Response: `{ sessionId: string, hostToken: string }`

The host saves `hostToken` to `localStorage` — required for all host-only actions.

---

### `GET /api/sessions/[id]?since=<updatedAt>`
Fetches session state with long polling.

- Without `since`: returns current state immediately
- With `since`: blocks up to **8 seconds**, polling Redis every **300ms**
  - Returns as soon as `session.updatedAt > since`
  - Reduces serverless invocations by ~5×

Response: `PublicSessionState`

---

### `POST /api/sessions/[id]/join`
A player joins the session.

Body: `{ playerName: string }` (max 50 chars, validated server-side)

Response: `{ playerId: string }` — numeric string ("0", "1", ...)

---

### `POST /api/sessions/[id]/start`
Host starts the game.

Body: `{ hostToken: string, boardConfig: BoardConfig }`

Creates a `Game` instance from `boardConfig`, saves `game.toJSON()` as `gameState`.

Response: `PublicSessionState`

---

### `POST /api/sessions/[id]/roll`
Current player rolls the dice.

Body: `{ playerId: string }`

Auth: `playerId === session.currentPlayerId`

Executes move, determines square type, sets `pendingAction` if needed.

Response: `PublicSessionState` with updated `diceResult` and `pendingAction`.

---

### `POST /api/sessions/[id]/action`
Resolves the pending action.

Body: `{ hostToken?: string, playerId?: string, success: boolean, winnerId?: string }`

**Who resolves depends on action type:**
- Host-resolved actions (`HOST_RESOLVED_ACTIONS`): requires valid `hostToken`
- Battle: requires `hostToken` + `winnerId`
- Self-resolved actions: requires `playerId === actorPlayerId`

Updates `gameState`, clears `pendingAction`, advances `currentPlayerId`.

Response: `PublicSessionState`

---

### `POST /api/sessions/[id]/select-target`
Sets `targetPlayerId` on the pending action.

Body: `{ playerId: string, targetId: string }`

Validation: `targetId` must exist in `session.players`.

Response: `PublicSessionState`

---

## Authentication Pattern

```ts
// Host-only:
if (body.hostToken !== session.hostToken)
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });

// Current player only:
if (body.playerId !== session.currentPlayerId)
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
```

## Next.js 15 — params as Promise

```ts
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;   // ALWAYS await
  // ...
}
```

## Full Turn Flow

```
Host creates session  →  POST /api/sessions
Player scans QR       →  GET  /join/[sessionId]  (redirect to /player/...)
Player joins          →  POST /api/sessions/[id]/join
Host starts game      →  POST /api/sessions/[id]/start
Current player rolls  →  POST /api/sessions/[id]/roll
  (if action needs a target)
Player selects target →  POST /api/sessions/[id]/select-target
Host resolves action  →  POST /api/sessions/[id]/action
  (loop to next turn)
```

All clients (host + players) long-poll `GET /api/sessions/[id]?since=updatedAt` to receive updates.

## Card Data (`PendingAction.card`)

The `card` field is `unknown` — serialized from the deck. Two possible shapes:

```ts
// Simple actions (quiz, mime, etc.)
{ cardTitle: string, cardText: string }

// Image actions (face-emotion, dictation-draw)
{ topic: { cardTitle: string, cardText: string }, imageUrl: string }
```

Use `getCardDisplay(card)` from `src/lib/card-utils.ts` for type-safe extraction.
