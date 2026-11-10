import type { GameJSON } from "@/model/game";
import type { SquareType } from "@/model/square/square";
import { MAX_PLAYERS, MAX_SQUARES, MIN_PLAYERS, MIN_SQUARES } from "@/vars";
import { MAX_MOVE, SQUARE_TYPES } from "./board-config";

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const isInt = (v: unknown): v is number =>
  typeof v === "number" && Number.isInteger(v);

const isIntInRange = (v: unknown, min: number, max: number): v is number =>
  isInt(v) && v >= min && v <= max;

/**
 * Controlla che un oggetto letto da un file di salvataggio descriva una
 * partita coerente, prima di ricostruirla con Game.fromJSON().
 * @returns null se il contenuto è valido, altrimenti il motivo dell'errore
 */
export function validateGameJSON(raw: unknown): string | null {
  if (!isObject(raw)) return "partita mancante";
  const game = raw as Partial<GameJSON> & Record<string, unknown>;

  // Giocatori
  const players = game.players;
  if (
    !Array.isArray(players) ||
    players.length < MIN_PLAYERS ||
    players.length > MAX_PLAYERS
  )
    return `servono da ${MIN_PLAYERS} a ${MAX_PLAYERS} giocatori`;
  const playerIds = new Set<number>();
  for (const p of players) {
    if (
      !isObject(p) ||
      !isIntInRange(p.id, 0, Number.MAX_SAFE_INTEGER) ||
      typeof p.name !== "string" ||
      !p.name.trim() ||
      !isIntInRange(p.turnsToSkip, 0, Number.MAX_SAFE_INTEGER)
    )
      return "giocatore non valido";
    if (playerIds.has(p.id)) return "id dei giocatori ripetuto";
    playerIds.add(p.id);
  }

  // Tabellone
  const board = game.board;
  if (!isObject(board)) return "tabellone mancante";
  const squares = board.squares;
  if (
    !Array.isArray(squares) ||
    squares.length < MIN_SQUARES ||
    squares.length > MAX_SQUARES
  )
    return `il tabellone deve avere da ${MIN_SQUARES} a ${MAX_SQUARES} caselle`;
  const squaresValid = squares.every(
    (sq, i) =>
      isObject(sq) &&
      sq.number === i &&
      SQUARE_TYPES.includes(sq.type as SquareType) &&
      (sq.type !== "move" || isIntInRange(sq.moveValue, -MAX_MOVE, MAX_MOVE)),
  );
  if (!squaresValid) return "casella non valida";

  // Posizioni: una per giocatore, dentro il tabellone
  const positions = board.playersPosition;
  if (!Array.isArray(positions) || positions.length !== players.length)
    return "posizioni dei giocatori non valide";
  const positioned = new Set<number>();
  for (const pos of positions) {
    if (
      !isObject(pos) ||
      !isInt(pos.playerId) ||
      !playerIds.has(pos.playerId) ||
      positioned.has(pos.playerId) ||
      !isIntInRange(pos.position, 0, squares.length - 1)
    )
      return "posizioni dei giocatori non valide";
    positioned.add(pos.playerId);
  }

  // Turno, round e fine partita
  if (!isIntInRange(game.currentTurn, 0, players.length - 1))
    return "turno non valido";
  if (!isIntInRange(game.currentRound, 1, Number.MAX_SAFE_INTEGER))
    return "round non valido";
  if (typeof game.gameEnded !== "boolean")
    return "stato di fine partita non valido";
  if (game.winnerId !== undefined && !playerIds.has(game.winnerId as number))
    return "vincitore non valido";
  if (game.gameEnded && game.winnerId === undefined)
    return "partita conclusa senza vincitore";
  if (
    game.battlesEnabled !== undefined &&
    typeof game.battlesEnabled !== "boolean"
  )
    return "battlesEnabled non valido";

  return null;
}
