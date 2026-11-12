#!/usr/bin/env node
// Carica nell'archivio Vercel Blob privato (cartella faces/) le fotografie
// FACES di "Indovina l'emozione" e le clip Dynamic FACES di "Emozioni in
// movimento". Non vanno nel repository.
//
// Uso:
//   BLOB_READ_WRITE_TOKEN=... node scripts/upload-faces-to-blob.mjs <cartella>
//
// <cartella> contiene:
// - {id}_{eta}_{genere}_{emozione}_{versione}.jpg (480 px di larghezza);
// - {id}_{eta}_{genere}_n_{emozione}.mp4 (clip originali, non modificate).
// Vengono caricati solo i file usati dai mazzi: sei soggetti, cinque emozioni
// (la neutralità è esclusa); 60 foto (due versioni) e 30 clip.

import { readFile } from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";

const SUBJECTS = [
  "004_o_m",
  "066_y_m",
  "079_o_f",
  "116_m_m",
  "140_y_f",
  "168_m_f",
];
const EMOTIONS = ["h", "a", "s", "d", "f"];
const VERSIONS = ["a", "b"];

const dir = process.argv[2];
if (!dir) {
  console.error("Uso: node scripts/upload-faces-to-blob.mjs <cartella>");
  process.exit(1);
}
if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.error("Manca BLOB_READ_WRITE_TOKEN");
  process.exit(1);
}

const photos = SUBJECTS.flatMap((s) =>
  EMOTIONS.flatMap((e) => VERSIONS.map((v) => `${s}_${e}_${v}.jpg`)),
);
const videos = SUBJECTS.flatMap((s) => EMOTIONS.map((e) => `${s}_n_${e}.mp4`));

let uploaded = 0;
for (const file of [...photos, ...videos]) {
  const body = await readFile(path.join(dir, file));
  await put(`faces/${file}`, body, {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: file.endsWith(".mp4") ? "video/mp4" : "image/jpeg",
  });
  uploaded++;
  console.log(`  ${file}`);
}
console.log(`\nCaricati ${uploaded} file in faces/`);
