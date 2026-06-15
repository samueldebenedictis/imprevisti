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
new Player(id: number, name: string)

player.getId(): number          // NOTE: number, not string
player.getName(): string
player.getPosition(): number
player.getTurnsToSkip(): number
player.skipTurn(): void
```

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
| `music-emotion` | Guess emotion from music |
| `physical-test` | Physical challenge |
| `what-would-you-do` | Hypothetical scenario |
| `dictation-draw` | Dictated drawing |

## Managers (`src/model/managers/`)

Each action type has a manager handling pre/post resolution logic. 15 managers total.

- Called by `/roll` route to build the `pendingAction`
- Called by `/action` route to update game state after resolution

## Deck System (`src/model/deck/`)

9 decks, one per action type. Each deck is a shuffled array of cards dealt in rotation.

```ts
// Simple card
{ cardTitle: string, cardText: string }

// Card with image (face-emotion, dictation-draw)
{ topic: { cardTitle: string, cardText: string }, imageUrl: string }
```

## Board Generation (`src/app/utils/generate-squares.ts`)

Takes config (`specialPercentage`, enabled types, total squares) and generates the `Square[]` array, distributing special types uniformly.

Used by:
- `POST /api/sessions/[id]/start` — multiplayer
- `src/store/game-store.ts` — single-player

## Zustand game-store (`src/store/game-store.ts`)

Single-player game state, persisted to localStorage. **Not used by multiplayer** (which uses server-side `SessionState`).

Key keys: `game`, `diceResult`, `pendingAction`, `gameOver`, `squaresConfig`.
