#!/usr/bin/env node
// Estrae un frame iniziale di ogni video in public/videos/*.webm e lo salva
// come "<nome-video>-poster.png" accanto al video stesso. Usato come
// immagine di copertina per il componente <Video>, al posto di un unico
// poster generico condiviso da tutti i video.
//
// Usa il binario ffmpeg incluso nell'immagine Docker di Playwright (i
// browser headless — incluso il default "chromium headless shell" — non
// decodificano l'audio/video di file locali in modo affidabile, quindi
// estrarre il frame via <video> in pagina si blocca a tempo indeterminato).
//
// Il frame è preso a 1s, non a 0s: nei nostri test la registrazione parte
// prima che la pagina abbia finito di caricare, quindi il fotogramma 0 è
// quasi sempre bianco/vuoto — inutile come copertina.
//
// Uso: docker compose run --rm playwright node scripts/extract-video-posters.mjs

import { execFileSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import path from "node:path";

const videosDir = path.resolve("public/videos");

const candidates = ["/ms-playwright/ffmpeg-1011/ffmpeg-linux", "ffmpeg"];
const ffmpeg = candidates.find((bin) => bin === "ffmpeg" || existsSync(bin));

const files = readdirSync(videosDir).filter((f) => f.endsWith(".webm"));

if (files.length === 0) {
  console.log("Nessun video trovato in public/videos");
  process.exit(0);
}

for (const file of files) {
  const videoPath = path.join(videosDir, file);
  const posterPath = path.join(
    videosDir,
    `${file.replace(/\.webm$/, "")}-poster.png`,
  );

  execFileSync(
    ffmpeg,
    [
      "-y",
      "-ss",
      "1",
      "-i",
      videoPath,
      "-frames:v",
      "1",
      "-q:v",
      "2",
      posterPath,
    ],
    { stdio: "pipe" },
  );

  console.log(`${file} -> ${path.basename(posterPath)}`);
}
