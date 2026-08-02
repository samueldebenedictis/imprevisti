# Frontend Patterns — La Città degli Imprevisti

## `useSessionPolling` (`src/lib/use-session-polling.ts`)

Main hook for multiplayer client-side sync.

```ts
import { useSessionPolling } from "@/lib/use-session-polling";
import type { IdleState } from "@/lib/use-session-polling";

const { session, error, idleState, resume } = useSessionPolling(sessionId);
```

### Full signature

```ts
useSessionPolling(
  sessionId: string | null,
  intervalMs?: number        // default 1500ms
): {
  session: PublicSessionState | null;
  error: string | null;
  idleState: IdleState;      // "active" | "idle" | "stopped"
  resume: () => void;
}
```

### Idle behavior

| State | When | Effect |
|-------|------|--------|
| `"active"` | Default | Polling running |
| `"idle"` | 30 min inactivity | Shows IdleOverlay with resume button |
| `"stopped"` | 5 min on overlay without interaction | Polling suspended |

Call `resume()` (or any user interaction) to return to `"active"`.

---

## `IdleOverlay` (`src/app/components/idle-overlay.tsx`)

```tsx
import { IdleOverlay } from "@/app/components/idle-overlay";

<IdleOverlay idleState={idleState} onResume={resume} />
```

Returns `null` when `idleState === "active"` — safe to always render.

Props:
```ts
{ idleState: IdleState; onResume: () => void }
```

---

## `getCardDisplay` (`src/lib/card-utils.ts`)

Extracts displayable data from `PendingAction.card` (type `unknown`).

```ts
import { getCardDisplay } from "@/lib/card-utils";

const { text, body, imageUrl } = getCardDisplay(pendingAction.card);
```

### Signature

```ts
getCardDisplay(card: unknown): {
  text: string;      // main title / text
  body: string;      // secondary text
  imageUrl?: string;
}
```

### Handled shapes

```ts
// Simple actions → { cardTitle, cardText }
{ text: card.cardTitle, body: card.cardText }

// Image actions → { topic: { cardTitle, cardText }, imageUrl }
{ text: card.topic.cardTitle, body: card.topic.cardText, imageUrl: card.imageUrl }

// Primitive fallback
{ text: String(card), body: "" }
```

---

## Pattern: cancelled flag (async fetch in useEffect)

Prevents state updates on unmounted components.

```ts
useEffect(() => {
  let cancelled = false;

  fetch("/api/sessions", { method: "POST" })
    .then((r) => r.json())
    .then(({ sessionId, hostToken }) => {
      if (cancelled) return;
      localStorage.setItem("hostToken", hostToken);
      router.replace(`/multiplayer/${sessionId}`);
    })
    .catch(() => {
      if (!cancelled) setError("Errore nella creazione della sessione.");
    });

  return () => {
    cancelled = true;
  };
}, [router]);
```

---

## Pattern: isResolving (prevent double-submit)

```ts
const [isResolving, setIsResolving] = useState(false);

const resolveAction = async (success: boolean) => {
  if (isResolving) return;
  setIsResolving(true);
  try {
    await fetch(...);
  } finally {
    setIsResolving(false);
  }
};

// In JSX:
<Button onClick={() => resolveAction(true)} disabled={isResolving}>
  Riuscito
</Button>
```

---

## Pattern: rollDice with try/finally

Guarantees `isRolling` resets even on network error.

```ts
const rollDice = async () => {
  setIsRolling(true);
  try {
    const [res] = await Promise.all([
      fetch(`/api/sessions/${sessionId}/roll`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId }),
      }).then((r) => r.json() as Promise<PublicSessionState>),
      new Promise<void>((r) => setTimeout(r, 1200)), // minimum animation time
    ]);
    setLocalDiceResult(res.diceResult);
    setLocalMoveInfo(res.lastMoveInfo ?? null);
  } catch {
    // noop: polling will recover the state
  } finally {
    setIsRolling(false);
  }
};
```

---

## Shared UI Components (`src/app/components/ui/`)

| Component | Import | Notes |
|-----------|--------|-------|
| `Button` | `@/app/components/ui/button` | Props: `color`, `disabled`, `onClick`, `className` |
| `Input` | `@/app/components/ui/input` | Styled `<input>` wrapper |
| `Label` | `@/app/components/ui/label` | Label + title variant |
| `Select` | `@/app/components/ui/select` | Styled dropdown |

---

## Zustand Stores

```ts
// Single-player game state (persisted to localStorage)
import { useGameStore } from "@/store/game-store";

// Game configuration (persisted to localStorage)
import { useConfigStore } from "@/store/config-store";

// Audio toggle
import { useSoundStore } from "@/store/sound-store";
```

These stores are **not used** by multiplayer mode. Multiplayer uses server-side `SessionState` + `useSessionPolling`.

---

## QR Code Join

```tsx
import { QrCode } from "@/app/components/qr-code";

<QrCode value={`${baseUrl}/join/${sessionId}`} />
```

Redirect page: `src/app/join/[sessionId]/page.tsx`
→ Reads `sessionId` from URL, redirects to `/player/[sessionId]/[playerId]` after join.

---

## Biome-ignore for intentional useEffect deps

When dependencies are intentionally limited (reset on action change, not every render):

```ts
useEffect(() => {
  // logic that should only run when action type/actor changes
}, [session?.pendingAction?.type, session?.pendingAction?.actorPlayerId]);
// biome-ignore lint/correctness/useExhaustiveDependencies: intentional reset on action change only
```

---

## Player device views

Full-screen views rendered by `src/app/player/[sessionId]/[playerId]/page.tsx` depending on turn phase.

### `PlayerRollView` (`src/app/components/player-roll-view.tsx`)

```tsx
import PlayerRollView from "@/app/components/player-roll-view";

<PlayerRollView isRolling={isRolling} onRollDice={() => void rollDice()} />
```

Props:
```ts
{ isRolling: boolean; onRollDice: () => void }
```

"È il tuo turno!" screen with a clickable `Dice` (also disabled while rolling) and a `Button` that both trigger `onRollDice`. Button label switches to "Lancio..." while `isRolling` is true.

---

### `PlayerRollResultView` (`src/app/components/player-roll-result-view.tsx`)

```tsx
import PlayerRollResultView from "@/app/components/player-roll-result-view";

<PlayerRollResultView
  diceResult={localDiceResult}
  moveInfo={localMoveInfo}
  onContinue={() => {
    setLocalDiceResult(null);
    setLocalMoveInfo(null);
  }}
/>
```

Props:
```ts
{
  diceResult: number;             // 0 = turn skipped
  moveInfo: LastMoveInfo | null;  // from PublicSessionState.lastMoveInfo
  onContinue: () => void;
}
```

Intermediate "you rolled N" screen shown between the roll and the next phase (action/waiting/spectator). Shows "Turno saltato!" when `diceResult === 0`; otherwise shows the `Dice` result and, if `moveInfo` is present, the landed-on square number plus its label via `ACTION_LABELS` (skipped for `"normal"`/`"move"` types). The "Avanti" button lets the player dismiss the result at their own pace — see the note on the `isRolling` / `localDiceResult` guard order below.

---

### `PlayerGameOverView` (`src/app/components/player-game-over-view.tsx`)

```tsx
import PlayerGameOverView from "@/app/components/player-game-over-view";

<PlayerGameOverView winnerName={session.gameOver.winnerName} />
```

Props:
```ts
{ winnerName: string }
```

End-of-game screen shown on a player's device: winner name plus a `Link` to `URL_FEEDBACK` (from `@/vars`) styled as a `Button`.

---

### Note: early-return guard order in the player page

In `src/app/player/[sessionId]/[playerId]/page.tsx`, the `isRolling` and `localDiceResult !== null` checks are placed as early returns *before* the session-driven phase branches (target-selection/actor/target/spectator/waiting). This isn't arbitrary — a code comment right above the `isRolling` guard explains why:

```ts
// Lancio in corso: il polling in background può già riflettere lo stato
// server post-lancio (es. pendingAction di un'azione speciale) prima che
// il client riceva la risposta della roll — non lasciare che l'azione
// interrompa l'animazione del dado.
if (isRolling) { ... }

// Risultato del lancio: pagina intermedia col bottone "Avanti" prima di
// mostrare direttamente il turno successivo (attesa/azione/spectator).
if (!isRolling && localDiceResult !== null) { ... }
```

Background polling keeps running during the roll `fetch`, so the session can already reflect the post-roll server state (e.g. a new `pendingAction`) before the roll response reaches the client. If the phase branches were checked first, that race would yank the player straight into the next phase's view mid dice-animation. Checking local roll state first guarantees the dice animation and the roll-result screen always run to completion, regardless of how fast the poller updates `session`.

---

### `PawnsLayer` (`src/app/components/pawns-layer.tsx`)

```tsx
import PawnsLayer from "@/app/components/pawns-layer";

<PawnsLayer
  players={playerPositions}
  currentPlayerId={session.currentPlayerId}
  cols={boardCols}
  totalSquares={totalSquares}
/>
```

Props:
```ts
{
  players: { id: string; name: string; position: number }[];
  currentPlayerId?: string | null;
  cols: number;
  totalSquares: number;
}
```

Board overlay that positions a `Pawn` per player on top of the grid via `cellStyle` (percentage `translate` based on `position`/`cols`). Players sharing a square are grouped; the current player's pawn is rendered separately from an "others" pawn (which collapses to a `"N altri giocatori"` label when more than one other player shares the square).

**`useSteppedPositions` hook**: rather than jumping a pawn straight to its new `position`, this internal hook keeps a `displayed` map of per-player positions and advances each stale entry by one square every `HOP_DURATION_MS` (260ms), re-triggering itself via its own `displayed` dependency until it catches up to the real position. New players (e.g. joining mid-game) are seeded directly at their current position with no hops. This makes multi-square moves visually hop tile-by-tile instead of teleporting, matching the physical board-game feel. The current player's pawn node is keyed by `player-${id}` (stable across hops, so the CSS `transition-transform` actually animates) while stationary pawns are keyed by `square-${position}`. Each hop also re-mounts a `.pawn-hop` wrapper (`src/app/globals.css`, a 260ms `translateY` keyframe bump) to give the pawn a little vertical bounce per step; `isCurrentPlayerTurn` on `Pawn` is suppressed (no `animate-bounce`) while a hop is in flight.
