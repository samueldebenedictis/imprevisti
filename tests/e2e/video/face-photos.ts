import { existsSync } from "node:fs";
import path from "node:path";
import type { Page } from "@playwright/test";

/**
 * Screenshot della sfida "Indovina l'emozione" in due versioni:
 * - con il segnaposto (nome normale): vanno nel repository;
 * - con la fotografia FACES vera (suffisso "-faces"): servono alla tesi e sono
 *   ignorati da git, perché la licenza FACES vieta di distribuire le foto.
 *
 * La foto vera viene messa dal test: la richiesta del segnaposto viene
 * intercettata e servita con un file di private/faces (ignorata da git).
 * Se la foto non c'è (ad esempio in CI), la versione "-faces" viene saltata.
 */

const FACES_DIR = path.join(process.cwd(), "private", "faces");
const PLACEHOLDER_ROUTE = "**/images/face-placeholder.svg";

export const FACE_PHOTO_SUFFIX = "-faces";

export interface FaceVariant {
  /** Suffisso del nome dello screenshot: "" oppure "-faces". */
  suffix: string;
  /** File di private/faces da mostrare al posto del segnaposto. */
  photo?: string;
}

/** Le due versioni di uno screenshot che mostra la foto `photo`. */
export const faceVariants = (photo: string): FaceVariant[] => [
  { suffix: "" },
  { suffix: FACE_PHOTO_SUFFIX, photo },
];

export const hasFacePhoto = (photo: string) =>
  existsSync(path.join(FACES_DIR, photo));

/** Mostra la foto vera al posto del segnaposto (solo per la versione "-faces"). */
export async function routeFacePhoto(page: Page, variant: FaceVariant) {
  const { photo } = variant;
  if (!photo) return;
  await page.route(PLACEHOLDER_ROUTE, (route) =>
    route.fulfill({
      path: path.join(FACES_DIR, photo),
      contentType: "image/jpeg",
    }),
  );
}
