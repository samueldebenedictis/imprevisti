import { readFile } from "node:fs/promises";
import path from "node:path";

/** Cartella dell'archivio Blob privato che contiene le fotografie FACES. */
export const FACES_BLOB_FOLDER = "faces";

export type FacesImage =
  | { kind: "image"; body: ReadableStream<Uint8Array> | Uint8Array }
  | { kind: "placeholder" };

/**
 * Legge una fotografia FACES dall'archivio privato.
 *
 * - Produzione: Vercel Blob privato (BLOB_READ_WRITE_TOKEN impostato).
 * - Sviluppo locale: cartella indicata da FACES_LOCAL_DIR, fuori dal repository
 *   o ignorata da git.
 * - Altrimenti (Docker, test e2e, CI): segnaposto senza volti, così gli
 *   screenshot generati dai test non contengono fotografie FACES.
 *
 * Restituisce null se il file non esiste.
 */
export async function readFacesImage(file: string): Promise<FacesImage | null> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { get } = await import("@vercel/blob");
    const result = await get(`${FACES_BLOB_FOLDER}/${file}`, {
      access: "private",
    });
    if (!result || result.statusCode !== 200) return null;
    return { kind: "image", body: result.stream };
  }

  const localDir = process.env.FACES_LOCAL_DIR;
  if (localDir) {
    try {
      const body = await readFile(path.join(localDir, file));
      return { kind: "image", body: new Uint8Array(body) };
    } catch {
      return null;
    }
  }

  return { kind: "placeholder" };
}
