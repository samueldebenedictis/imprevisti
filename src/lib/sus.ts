import type { FeedbackEntry } from "@/types/feedback";

// Le 10 domande SUS alternano polarità: dispari positive, pari negative.
// https://en.wikipedia.org/wiki/System_usability_scale
const SUS_KEYS = [
  "sus1",
  "sus2",
  "sus3",
  "sus4",
  "sus5",
  "sus6",
  "sus7",
  "sus8",
  "sus9",
  "sus10",
] as const satisfies readonly (keyof FeedbackEntry)[];

export function computeSusScore(entry: FeedbackEntry): number | null {
  const scores = SUS_KEYS.map((key) => entry[key]);
  if (
    !scores.every(
      (score): score is number => typeof score === "number" && score > 0,
    )
  ) {
    return null;
  }

  let total = 0;
  for (const [index, value] of scores.entries()) {
    total += index % 2 === 0 ? value - 1 : 5 - value;
  }

  return total * 2.5;
}

export type SusGrade = "excellent" | "good" | "ok" | "poor";

export function susGrade(score: number): SusGrade {
  if (score >= 80) return "excellent";
  if (score >= 60) return "good";
  if (score >= 40) return "ok";
  return "poor";
}

export const SUS_GRADE_LABEL: Record<SusGrade, string> = {
  excellent: "Eccellente",
  good: "Buono",
  ok: "Nella norma",
  poor: "Da migliorare",
};

// Colori status del design system (mai riusati per identità di serie).
export const SUS_GRADE_COLOR: Record<SusGrade, string> = {
  excellent: "#0ca30c",
  good: "#fab219",
  ok: "#ec835a",
  poor: "#d03b3b",
};
