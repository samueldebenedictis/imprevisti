import { createHash, randomInt, timingSafeEqual } from "node:crypto";

/**
 * Codici monouso per le fotografie FACES, generati dagli educatori.
 * Alfabeto senza caratteri che si confondono (0/O, 1/I/L).
 */
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
// 8 caratteri: 31^8 ≈ 852 miliardi di combinazioni, impossibili da indovinare
export const FACES_CODE_LENGTH = 8;

export function generateFacesCode(): string {
  return Array.from(
    { length: FACES_CODE_LENGTH },
    () => CODE_ALPHABET[randomInt(CODE_ALPHABET.length)],
  ).join("");
}

/** Codice scritto dall'utente: maiuscolo, senza spazi né trattini. */
export const normalizeFacesCode = (input: string) =>
  input.toUpperCase().replace(/[\s-]/g, "");

export const isFacesCodeFormat = (code: string) =>
  code.length === FACES_CODE_LENGTH &&
  [...code].every((c) => CODE_ALPHABET.includes(c));

const digest = (value: string) => createHash("sha256").update(value).digest();

/**
 * Segreto della pagina educatori (variabile d'ambiente FACES_CODES_SECRET).
 * Senza variabile nessuno può generare codici.
 */
export function isFacesCodesSecret(candidate: unknown): boolean {
  const secret = process.env.FACES_CODES_SECRET;
  if (!secret || typeof candidate !== "string") return false;
  return timingSafeEqual(digest(candidate), digest(secret));
}
