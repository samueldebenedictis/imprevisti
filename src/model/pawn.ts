/**
 * Aspetto della pedina di un giocatore: colore e forma scelti all'ingresso
 * nella partita. Colori ripetuti ammessi: il nome distingue comunque.
 */
// Ordine cromatico (ruota dal rosso al rosa), sia per la scelta sia per le
// pedine predefinite: il giocatore N prende il colore N
export const PAWN_COLORS = [
  "red",
  "orange",
  "yellow",
  "green",
  "cyan",
  "blue",
  "purple",
  "pink",
] as const;

export const PAWN_SHAPES = [
  "square",
  "rounded",
  "pill",
  "hexagon",
  "parallelogram",
] as const;

export type PawnColor = (typeof PAWN_COLORS)[number];
export type PawnShape = (typeof PAWN_SHAPES)[number];

export interface PawnStyle {
  color: PawnColor;
  shape: PawnShape;
}

/**
 * Pedina predefinita del giocatore in posizione `index`: deterministica
 * (niente caso), così test e screenshot restano stabili. Vale anche per le
 * partite salvate prima delle pedine personalizzate.
 */
export function defaultPawn(index: number): PawnStyle {
  const i = Math.abs(Math.trunc(index)) || 0;
  return { color: PAWN_COLORS[i % PAWN_COLORS.length], shape: "square" };
}

export function isPawnStyle(value: unknown): value is PawnStyle {
  if (typeof value !== "object" || value === null) return false;
  const { color, shape } = value as Record<string, unknown>;
  return (
    (PAWN_COLORS as readonly unknown[]).includes(color) &&
    (PAWN_SHAPES as readonly unknown[]).includes(shape)
  );
}

/** La pedina, se valida, altrimenti quella predefinita per `index`. */
export const pawnOrDefault = (value: unknown, index: number): PawnStyle =>
  isPawnStyle(value)
    ? { color: value.color, shape: value.shape }
    : defaultPawn(index);
