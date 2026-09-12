import { describe, expect, it } from "vitest";
import { computeSusScore, susGrade } from "@/lib/sus";
import type { FeedbackEntry } from "@/types/feedback";

const baseEntry: FeedbackEntry = {
  id: "1",
  submittedAt: new Date().toISOString(),
};

function withSus(scores: number[]): FeedbackEntry {
  const entry: FeedbackEntry = { ...baseEntry };
  for (let i = 0; i < scores.length; i++) {
    (entry as Record<string, number>)[`sus${i + 1}`] = scores[i];
  }
  return entry;
}

describe("computeSusScore", () => {
  it("returns 100 for the best possible answers", () => {
    // Dispari: 5 (max accordo), pari: 1 (min accordo) -> contributo massimo su ogni item
    const entry = withSus([5, 1, 5, 1, 5, 1, 5, 1, 5, 1]);
    expect(computeSusScore(entry)).toBe(100);
  });

  it("returns 0 for the worst possible answers", () => {
    const entry = withSus([1, 5, 1, 5, 1, 5, 1, 5, 1, 5]);
    expect(computeSusScore(entry)).toBe(0);
  });

  it("returns 50 for neutral (all 3) answers", () => {
    const entry = withSus(Array(10).fill(3));
    expect(computeSusScore(entry)).toBe(50);
  });

  it("returns null when some sus answers are missing", () => {
    const entry = withSus([5, 1, 5, 1, 5, 1, 5, 1, 5]); // solo 9 risposte
    expect(computeSusScore(entry)).toBeNull();
  });
});

describe("susGrade", () => {
  it("grades thresholds correctly", () => {
    expect(susGrade(85)).toBe("excellent");
    expect(susGrade(65)).toBe("good");
    expect(susGrade(45)).toBe("ok");
    expect(susGrade(20)).toBe("poor");
  });
});
