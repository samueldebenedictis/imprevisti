#!/usr/bin/env node
// Carica le fotografie FACES del mazzo "Indovina l'emozione" nell'archivio
// Vercel Blob privato (cartella faces/). Le foto NON vanno nel repository.
//
// Uso:
//   BLOB_READ_WRITE_TOKEN=... node scripts/upload-faces-to-blob.mjs <cartella>
//
// <cartella> contiene i file {id}_{eta}_{genere}_{emozione}_{versione}.jpg
// (480 px di larghezza). Vengono caricati solo i 60 file usati dal mazzo:
// sei soggetti, cinque emozioni (la neutralità è esclusa), due versioni.

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

const files = SUBJECTS.flatMap((s) =>
  EMOTIONS.flatMap((e) => VERSIONS.map((v) => `${s}_${e}_${v}.jpg`)),
);

let uploaded = 0;
for (const file of files) {
  const body = await readFile(path.join(dir, file));
  await put(`faces/${file}`, body, {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "image/jpeg",
  });
  uploaded++;
  console.log(`  ${file}`);
}
console.log(`\nCaricate ${uploaded} fotografie in faces/`);
