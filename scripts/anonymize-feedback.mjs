#!/usr/bin/env node
// Applica ai feedback già salvati su Upstash le stesse regole di
// minimizzazione di /api/feedback: rimuove il nome, lascia solo i campi
// previsti, sostituisce l'id (era Date.now()) con un UUID casuale e
// tronca submittedAt alla sola data.
//
// Prima di scrivere salva un backup completo in locale. Senza --apply
// mostra solo cosa cambierebbe.
//
// Uso:
//   KV_REST_API_URL=... KV_REST_API_TOKEN=... node scripts/anonymize-feedback.mjs
//   KV_REST_API_URL=... KV_REST_API_TOKEN=... node scripts/anonymize-feedback.mjs --apply

import { randomUUID } from "node:crypto";
import { writeFileSync } from "node:fs";
import { Redis } from "@upstash/redis";

const KEY = "feedback:list";
const TMP_KEY = "feedback:list:anonymized";

// Stesso elenco di src/app/api/feedback/route.ts, senza "name": i nomi
// raccolti con il vecchio campo obbligatorio vengono eliminati.
const ALLOWED_FIELDS = [
  "ageGroup",
  "gameExperience",
  "screenMode",
  "autismIdentification",
  "appVersion",
  "digitalVsPhysical",
  "gameplayClarity",
  "graphics",
  "enjoyment",
  "funLevel",
  ...Array.from({ length: 10 }, (_, i) => `sus${i + 1}`),
  "whatWorkedWell",
  "challenges",
  "suggestions",
];

const apply = process.argv.includes("--apply");

if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
  console.error("Servono KV_REST_API_URL e KV_REST_API_TOKEN.");
  process.exit(1);
}

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
  automaticDeserialization: false,
});

function anonymize(entry) {
  return {
    ...Object.fromEntries(
      ALLOWED_FIELDS.filter((key) => key in entry).map((key) => [
        key,
        entry[key],
      ]),
    ),
    submittedAt: String(entry.submittedAt ?? "").slice(0, 10),
    id: randomUUID(),
  };
}

const raw = await redis.lrange(KEY, 0, -1);
console.log(`${raw.length} feedback in ${KEY}`);
if (raw.length === 0) process.exit(0);

const backupFile = `feedback-backup-${Date.now()}.json`;
writeFileSync(backupFile, JSON.stringify(raw, null, 2));
console.log(
  `Backup salvato in ${backupFile} (contiene i dati originali: cancellalo dopo il controllo)`,
);

const cleaned = raw.map((item) => JSON.stringify(anonymize(JSON.parse(item))));

const withName = raw.filter((item) => JSON.parse(item).name).length;
console.log(`Record con nome: ${withName}`);
console.log("Esempio prima:", raw[0]);
console.log("Esempio dopo: ", cleaned[0]);

if (!apply) {
  console.log(
    "\nDry run: nessuna modifica. Rilancia con --apply per scrivere.",
  );
  process.exit(0);
}

// Scrive la lista pulita in una chiave temporanea (stesso ordine) e poi la
// sostituisce a quella originale con RENAME, che è atomico.
await redis.del(TMP_KEY);
await redis.rpush(TMP_KEY, ...cleaned);

// Se nel frattempo è arrivato un nuovo feedback, non sovrascrivere.
if ((await redis.llen(KEY)) !== raw.length) {
  await redis.del(TMP_KEY);
  console.error(
    "La lista è cambiata durante l'esecuzione: niente scritto, rilancia.",
  );
  process.exit(1);
}
await redis.rename(TMP_KEY, KEY);

console.log(`\nFatto: ${cleaned.length} feedback anonimizzati.`);
