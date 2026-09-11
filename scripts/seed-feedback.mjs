#!/usr/bin/env node
// Genera feedback fittizi e li invia a /api/feedback in locale, per popolare
// velocemente la dashboard (/admin/feedback) durante lo sviluppo senza dover
// compilare il form a mano decine di volte.
//
// I punteggi SUS e le valutazioni sono generati a bande di qualità
// (poor/ok/good/excellent, cicliche sugli indici) così la dashboard mostra
// da subito tutti i gradi/colori e una distribuzione realistica, non dati
// piatti tutti uguali.
//
// Uso:
//   node scripts/seed-feedback.mjs [count] [--url http://localhost:3000]
//   npm run seed:feedback -- 30

import { readFileSync } from "node:fs";

const { version: appVersion } = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url)),
);

const args = process.argv.slice(2);
const urlFlagIndex = args.indexOf("--url");
const baseUrl =
  urlFlagIndex !== -1 ? args[urlFlagIndex + 1] : "http://localhost:3000";
const count = Number(args.find((a) => /^\d+$/.test(a))) || 20;

const NAMES = [
  "Giulia",
  "Marco",
  "Sofia",
  "Luca",
  "Alice",
  "Matteo",
  "Elena",
  "Davide",
  "Francesca",
  "Andrea",
  "Chiara",
  "Simone",
  "Martina",
  "Riccardo",
  "Sara",
];

const WHAT_WORKED = [
  "La grafica colorata piace molto.",
  "Le regole erano chiare fin da subito.",
  "Il tabellone digitale è comodo da usare.",
  "Mi è piaciuto poter giocare su più schermi.",
  "L'audio delle carte rende tutto più divertente.",
];

const CHALLENGES = [
  "Alcuni testi sono un po' piccoli da leggere.",
  "Ogni tanto il dado si blocca.",
  "Non era chiaro come cambiare schermo.",
  "Il caricamento tra le caselle è lento.",
];

const SUGGESTIONS = [
  "Aggiungere più livelli di difficoltà.",
  "Un tutorial iniziale più lungo.",
  "Font più grande per chi ha difficoltà di lettura.",
  "Più effetti sonori durante il turno.",
  "Salvataggio automatico della partita.",
];

// Bande di qualità usate per generare SUS/rating coerenti tra loro:
// quality alto -> risposte SUS migliori e voti più alti, con un po' di rumore.
const QUALITY_BANDS = [
  [0.05, 0.3], // poor
  [0.3, 0.55], // ok
  [0.55, 0.8], // good
  [0.8, 0.98], // excellent
];

const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[randomInt(0, arr.length - 1)];
const maybe = (value, probability) =>
  Math.random() < probability ? value : undefined;
const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

function randomSusAnswers(quality) {
  const answers = {};
  for (let i = 1; i <= 10; i++) {
    const positive = i % 2 === 1; // sus1,3,5,7,9 sono affermazioni positive
    const base = positive ? quality : 1 - quality;
    const score = clamp(
      Math.round(1 + base * 4 + (Math.random() - 0.5) * 1.5),
      1,
      5,
    );
    answers[`sus${i}`] = score;
  }
  return answers;
}

function randomRating(quality) {
  return clamp(Math.round(1 + quality * 4 + (Math.random() - 0.5) * 1.5), 1, 5);
}

function buildEntry(index) {
  const [min, max] = QUALITY_BANDS[index % QUALITY_BANDS.length];
  const quality = min + Math.random() * (max - min);

  return {
    name: `${pick(NAMES)} ${index + 1}`,
    ageGroup: pick(["docente", "alunno", "none"]),
    gameExperience: pick(["fisico", "digitale", "esperto"]),
    screenMode: pick(["singolo", "multi"]),
    autismIdentification: pick([
      "si_diagnosi",
      "si_non_diagnosticato",
      "no",
      "preferisco_non_rispondere",
      "",
    ]),
    appVersion,
    digitalVsPhysical: maybe(randomRating(quality), 0.8),
    gameplayClarity: randomRating(quality),
    graphics: randomRating(quality),
    enjoyment: randomRating(quality),
    funLevel: randomRating(quality),
    ...randomSusAnswers(quality),
    whatWorkedWell: maybe(pick(WHAT_WORKED), 0.7) ?? "",
    challenges: maybe(pick(CHALLENGES), 0.6) ?? "",
    suggestions: maybe(pick(SUGGESTIONS), 0.6) ?? "",
  };
}

async function seed() {
  console.log(`Invio ${count} feedback fittizi a ${baseUrl}/api/feedback ...`);
  let ok = 0;
  for (let i = 0; i < count; i++) {
    const entry = buildEntry(i);
    const res = await fetch(`${baseUrl}/api/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    });
    if (res.ok) {
      ok++;
    } else {
      console.error(`Errore invio feedback #${i + 1}: ${res.status}`);
    }
  }
  console.log(`Completato: ${ok}/${count} feedback creati.`);
}

seed();
