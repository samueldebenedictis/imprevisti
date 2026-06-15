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
