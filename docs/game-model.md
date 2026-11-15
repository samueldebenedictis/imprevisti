# Game Model — La Città degli Imprevisti

The game engine lives in `src/model/`. Pure logic: no UI, no network, no browser dependencies.

## Core Classes

### `Game` (`src/model/game.ts`)
Main orchestrator. Manages turns, player movement, and action resolution.

```ts
new Game(board: Board)

game.getPlayers(): Player[]
game.getTurn(): number          // global turn index (not player index)
game.getBoard(): Board
game.toJSON(): GameJSON
Game.fromJSON(json: GameJSON): Game
```

Current player derivation:
```ts
const players = game.getPlayers();
const currentPlayerId = String(players[game.getTurn() % players.length].getId());
```

### `Board` (`src/model/board.ts`)
The board: array of `Square` + array of `Player`.

```ts
new Board(squares: Square[], players: Player[])

board.getSquare(index: number): Square
board.getPlayers(): Player[]
```

### `Player` (`src/model/player.ts`)
```ts
new Player(id: number, name: string, pawn?: PawnStyle)

player.getId(): number          // NOTE: number, not string
player.getName(): string
player.getPawn(): PawnStyle     // { color, shape } of the pawn
player.getPosition(): number
player.getTurnsToSkip(): number
player.skipTurn(): void
```

**Pawn** (`src/model/pawn.ts`): `PawnStyle = { color, shape }`, with 8 colors (`PAWN_COLORS`) and 5 shapes (`PAWN_SHAPES`: `square`, `rounded`, `pill`, `hexagon`, `parallelogram`). Repeated colors are allowed. Without a choice, `defaultPawn(index)` gives `PAWN_COLORS[index % 8]` and `square`: deterministic (no randomness), so tests and screenshots are stable. `PAWN_COLORS` is in hue order (red, orange, yellow, green, cyan, blue, purple, pink) and is used both by the picker and for defaults, so player N gets the N-th swatch. `PlayerJSON.pawn` is optional: old saves get the default pawn, an invalid pawn makes `validateGameJSON` fail. `pawnOrDefault(value, index)` validates untrusted input (saves, `/join`, persisted config).

On the board (`PawnsLayer`) up to 3 pawns on the same square are all shown with their color and shape; with 4 or more, the current player's pawn plus one neutral "N giocatori" pawn. The current player is shown by the bounce animation. `hexagon` and `parallelogram` are drawn with `clip-path` and an SVG polygon border, with `py-1` so every shape has the same height.

**ID type mismatch**: `Player.getId()` returns `number`; `SessionPlayer.id` is `string`.

```ts
// model → session
String(player.getId())   // "0", "1", ...

// session → model
game.getPlayers().find(p => String(p.getId()) === sessionPlayer.id)
```

### `Square` (`src/model/square/square.ts`)
Base square class. Subclasses for each special type.

```ts
new Square(index: number)
square.getIndex(): number
square.getType(): string
```

### `Dice` (`src/model/dice.ts`)
```ts
new Dice()
dice.roll(): number   // 1–6
```

### `Battle` (`src/model/battle.ts`)
Challenge between two players.

```ts
new Battle(actor: Player, target: Player)
battle.getActor(): Player
battle.getTarget(): Player
```

## Serialization

Used for localStorage persistence (single-player) and network transmission (multiplayer):

```ts
const json: GameJSON = game.toJSON()   // → plain serializable object
const game: Game = Game.fromJSON(json) // → reconstructed instance
```

`GameJSON` is stored in `SessionState.gameState`. On reconnect or client switch, reconstruct with `Game.fromJSON(session.gameState)`.

## Square Types (`src/model/square/`)

| Type | Description |
|------|-------------|
| `move` | Movement square (advance/retreat) |
| `quiz` | Open-answer question |
| `mime` | Something to mime |
| `backwrite` | Write on someone's back |
| `face-emotion` | Express emotion with your face |
| `emotion-video` | "Emozioni in movimento": guess the emotion of a Dynamic FACES clip (neutral → emotion); without a FACES code these squares become `face-emotion` |
| `music-emotion` | Guess emotion from music |
| `physical-test` | Physical challenge |
| `what-would-you-do` | Hypothetical scenario |
| `dictation-draw` | Dictated drawing |

## Managers (`src/model/managers/`)

Each action type has a manager handling pre/post resolution logic. 15 managers total.

- Called by `/roll` route to build the `pendingAction`
- Called by `/action` route to update game state after resolution

## Deck System (`src/model/deck/`)

10 decks, one per action type. Each deck is a shuffled array of cards dealt in rotation.

```ts
// Simple card
{ cardTitle: string, cardText: string }

// Card with image (face-emotion, dictation-draw)
{ topic: { cardTitle: string, cardText: string }, imageUrl: string }

// Card with video (emotion-video)
{ topic: { cardTitle: string, cardText: string }, videoUrl: string }
```

### Face-emotion images and clips (FACES)

Each game has a **face set** (`faceSet` in `GameJSON`, `Game.getFaceSet()`):

- `"faces"`: photographs from the FACES database (subjects 004, 066, 079, 116, 140, 168; neutral excluded). Their licence forbids distributing them, so they are **not** in the repository nor in `public/`: cards point to `/api/faces/{file}` (`{id}_{age}_{sex}_{expr}_{set}.jpg`).
  Their Dynamic FACES clips (same subjects, neutral → emotion, 2 s, `{id}_{age}_{sex}_n_{expr}.mp4`, used unmodified) feed "Emozioni in movimento" (`emotion-video`).
- `"ai"` (default, also for old saves): 36 illustrated faces made for the project (`public/images/face-emotion/`, 6 faces × felicità, rabbia, tristezza, sorpresa, paura, stanchezza). Used when a game has no FACES code or the disclaimer is not accepted. There are no illustrated clips: `squaresForFaceSet` turns `emotion-video` squares into `face-emotion` squares, so the board keeps the same number of challenges.

Access rules agreed with FACES (November 2026):

1. An educator generates a **one-time code** on `/educatore/codice` (protected by `FACES_CODES_SECRET`). A code has 8 characters from a 31-symbol alphabet (31⁸ ≈ 8.5 × 10¹¹ combinations, so guessing one is impractical without a rate limit), is shown as `K7PM-3XQ2`, is valid 24 hours if unused and works for **one game only**.
2. At game setup, if the board includes "Indovina l'emozione" or "Emozioni in movimento", a modal asks for the code and the FACES disclaimer. `POST /api/faces/access {code, mode}` uses the code (GETDEL, so it cannot be reused) and creates a *grant* valid as long as a game (4 hours). `mode` is `"single"` or `"multi"`: only a `"multi"` grant can later be bound to a multiplayer game. The device gets an httpOnly cookie `faces_grant` (path `/api`) whose token points to the grant. Without a code: `faceSet = "ai"`.
3. Multiplayer: only the host enters the code. `/api/sessions/[id]/start` reads the host cookie and stores the grant in the session (`facesGrantId`, never public). A grant is bound to the first game that uses it (`bindFacesGrant`): the key `faces-grant-free:{id}` is consumed with GETDEL, so of two concurrent starts (even of different games) only one wins, and a second game gets the illustrated faces. Players' phones accept the disclaimer and call `POST /api/faces/access {sessionId, secret}`: `secret` is the `playerSecret` returned by `/join` (or the host token on the board), so knowing the session id is not enough.
   Known limit: a single-screen game runs entirely in the browser, so the server cannot count how many single-screen games one device plays with the same grant (only by tampering with requests, within 4 hours).
4. `/api/faces/[file]` serves a photo (`image/jpeg`) or a clip (`video/mp4`) only with a valid token **and** an active grant, with `Cache-Control: no-store`. Only the 60 photos and 30 clips of the decks are allowed. The client downloads clips whole and plays them from memory (`EmotionVideoPlayer`), so no Range requests are needed on iOS.

Codes and the secret are never published (repository, README). The public game URL may stay in the README.

## Board Generation (`src/app/utils/generate-squares.ts`)

Takes config (`specialPercentage`, enabled types, total squares) and generates the `Square[]` array, distributing special types uniformly.

Used by:
- `POST /api/sessions/[id]/start` — multiplayer
- `src/store/game-store.ts` — single-player

## Zustand game-store (`src/store/game-store.ts`)

Single-player game state, persisted to localStorage. **Not used by multiplayer** (which uses server-side `SessionState`).

Key keys: `game`, `diceResult`, `pendingAction`, `gameOver`, `squaresConfig`.
