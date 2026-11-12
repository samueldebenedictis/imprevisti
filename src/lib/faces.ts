import { FACES_API_PREFIX } from "@/model/deck/face-emotion";

/**
 * Fotografie FACES (Ebner, Riediger & Lindenberger, 2010).
 *
 * La licenza vieta di distribuirle: non sono tra i file pubblici, ma in un
 * archivio privato. Il Route Handler /api/faces/[file] le restituisce solo ai
 * dispositivi che hanno accettato il disclaimer (punto 4 del FACES Platform
 * Release Agreement), in una partita avviata con un codice monouso dato
 * dall'educatore, senza permetterne la memorizzazione nella cache.
 */

/**
 * Cookie con il token d'accesso rilasciato dopo codice e disclaimer.
 * Nome diverso dal vecchio "faces_access" (path /api/faces), che il browser
 * manderebbe per primo alle foto, prima di questo.
 */
export const FACES_ACCESS_COOKIE = "faces_grant";

export const FACES_ACCESS_API = "/api/faces/access";

/**
 * Il cookie vale per tutte le API: serve anche all'avvio di una partita
 * multigiocatore (/api/sessions/.../start), per legare il codice alla partita.
 */
export const FACES_COOKIE_PATH = "/api";

export const FACES_CODES_API = "/api/faces/codes";

export const isFacesImageUrl = (url: string) =>
  url.startsWith(FACES_API_PREFIX) &&
  url !== FACES_ACCESS_API &&
  url !== FACES_CODES_API;

/** Testo del disclaimer fornito da FACES, da accettare prima delle foto. */
export const FACES_DISCLAIMER_EN =
  "I herewith commit myself not to distribute, publish, copy, or further disseminate to third parties any of the objects shown to me in the following.";

export const FACES_DISCLAIMER_IT =
  "Mi impegno a non distribuire, pubblicare, copiare o diffondere in alcun modo a terzi le immagini che mi verranno mostrate.";
