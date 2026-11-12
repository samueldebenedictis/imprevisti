import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { expect, type Page } from "@playwright/test";

/**
 * Screenshot delle sfide con materiale FACES ("Indovina l'emozione", foto, e
 * "Emozioni in movimento", clip) in due versioni:
 * - con il segnaposto (nome normale): vanno nel repository;
 * - con la foto o la clip FACES vera (suffisso "-faces"): servono alla tesi e
 *   sono ignorati da git, perché la licenza FACES vieta di distribuirle.
 *
 * Il materiale vero viene messo dal test: la richiesta del segnaposto viene
 * intercettata e servita con un file di private/faces (ignorata da git).
 * Se il file non c'è (ad esempio in CI), la versione "-faces" viene saltata.
 */

const FACES_DIR = path.join(process.cwd(), "private", "faces");
const PHOTO_PLACEHOLDER_ROUTE = "**/images/face-placeholder.svg";
const VIDEO_PLACEHOLDER_ROUTE = "**/videos/emotion-video-placeholder.mp4";

export const FACE_PHOTO_SUFFIX = "-faces";

export interface FaceVariant {
  /** Suffisso del nome dello screenshot: "" oppure "-faces". */
  suffix: string;
  /** File di private/faces (.jpg o .mp4) da mostrare al posto del segnaposto. */
  photo?: string;
}

/** Le due versioni di uno screenshot che mostra la foto `photo`. */
export const faceVariants = (photo: string): FaceVariant[] => [
  { suffix: "" },
  { suffix: FACE_PHOTO_SUFFIX, photo },
];

export const hasFacePhoto = (photo: string) =>
  existsSync(path.join(FACES_DIR, photo));

/** Mostra la foto o la clip vera al posto del segnaposto (solo versione "-faces"). */
export async function routeFacePhoto(page: Page, variant: FaceVariant) {
  const { photo } = variant;
  if (!photo) return;
  const file = path.join(FACES_DIR, photo);
  if (!photo.endsWith(".mp4")) {
    await page.route(PHOTO_PLACEHOLDER_ROUTE, (route) =>
      route.fulfill({ path: file, contentType: "image/jpeg" }),
    );
    return;
  }
  // Clip: risposta a intervalli (Range), come un server vero. Senza, Chrome
  // non permette di spostarsi nel video e non si può fermarlo sull'emozione.
  const body = readFileSync(file);
  await page.route(VIDEO_PLACEHOLDER_ROUTE, (route) => {
    const headers = { "Content-Type": "video/mp4", "Accept-Ranges": "bytes" };
    const range = /bytes=(\d+)-(\d*)/.exec(
      route.request().headers().range ?? "",
    );
    if (!range) return route.fulfill({ body, headers });
    const start = Number(range[1]);
    const end = range[2] ? Number(range[2]) : body.length - 1;
    return route.fulfill({
      status: 206,
      body: body.subarray(start, end + 1),
      headers: {
        ...headers,
        "Content-Range": `bytes ${start}-${end}/${body.length}`,
      },
    });
  });
}

/**
 * Ferma le clip sull'ultimo fotogramma (l'emozione): si ripetono all'infinito,
 * quindi senza fermarle lo screenshot cambierebbe a ogni esecuzione.
 */
export async function freezeVideosOnLastFrame(page: Page) {
  const atEnd = () =>
    [...document.querySelectorAll("video")].every(
      (v) => v.paused && !v.seeking && v.currentTime >= v.duration - 0.1,
    );
  await page.waitForFunction(() => {
    const videos = [...document.querySelectorAll("video")];
    return videos.length > 0 && videos.every((v) => v.readyState >= 1);
  });
  // Il loop riporta la clip all'inizio: si ripete finché resta ferma alla fine
  await expect(async () => {
    await page.evaluate(() => {
      for (const v of document.querySelectorAll("video")) {
        v.pause();
        v.currentTime = Math.max(0, v.duration - 0.05);
      }
    });
    await page.waitForFunction(atEnd, null, { timeout: 1000 });
  }).toPass();
}
