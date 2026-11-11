import { FACES_API_PREFIX } from "@/model/deck/face-emotion";

/**
 * Fotografie FACES (Ebner, Riediger & Lindenberger, 2010).
 *
 * La licenza vieta di distribuirle: non sono tra i file pubblici, ma in un
 * archivio privato. Il Route Handler /api/faces/[file] le restituisce solo ai
 * dispositivi che hanno accettato il disclaimer (punto 4 del FACES Platform
 * Release Agreement), senza permetterne la memorizzazione nella cache.
 */

/** Cookie con il token d'accesso rilasciato dopo l'accettazione. */
export const FACES_ACCESS_COOKIE = "faces_access";

export const FACES_ACCESS_API = "/api/faces/access";

export const isFacesImageUrl = (url: string) =>
  url.startsWith(FACES_API_PREFIX) && url !== FACES_ACCESS_API;

/** Testo del disclaimer fornito da FACES, da accettare prima delle foto. */
export const FACES_DISCLAIMER_EN =
  "I herewith commit myself not to distribute, publish, copy, or further disseminate to third parties any of the objects shown to me in the following.";

export const FACES_DISCLAIMER_IT =
  "Mi impegno a non distribuire, pubblicare, copiare o diffondere in alcun modo a terzi le immagini che mi verranno mostrate.";
