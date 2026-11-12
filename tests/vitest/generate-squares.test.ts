import { describe, expect, test } from "vitest";
import {
  countSpecialSquares,
  generateSquares,
  getEnabledSpecialTypes,
  maxSpecialSquares,
  percentageForSpecialSquares,
  type SpecialSquareTypes,
  specialSquaresForPercentage,
} from "@/app/utils/generate-squares";
import { MAX_SQUARES, MIN_SQUARES } from "@/vars";

const allTypes = (enabled: boolean): SpecialSquareTypes => ({
  mime: enabled,
  quiz: enabled,
  move: enabled,
  backwrite: enabled,
  "face-emotion": enabled,
  "emotion-video": enabled,
  "music-emotion": enabled,
  "physical-test": enabled,
  "what-would-you-do": enabled,
  "dictation-draw": enabled,
});

const specials = (squares: { type: string }[]) =>
  squares.filter((s) => s.type !== "normal").length;

describe("countSpecialSquares", () => {
  test.each([
    [30, 0.2, 6],
    [30, 0.25, 7],
    [10, 1, 8],
    [100, 0, 0],
  ])(
    "%i caselle al %f: %i speciali, come nel tabellone generato",
    (n, pct, expected) => {
      expect(countSpecialSquares(n, allTypes(true), pct)).toBe(expected);
      expect(specials(generateSquares(n, allTypes(true), pct))).toBe(expected);
    },
  );

  test("nessun tipo spuntato: zero", () => {
    expect(countSpecialSquares(30, allTypes(false), 0.5)).toBe(0);
    expect(specials(generateSquares(30, allTypes(false), 0.5))).toBe(0);
  });

  test("numero di caselle non valido mentre si scrive: zero", () => {
    expect(countSpecialSquares(Number.NaN, allTypes(true), 0.2)).toBe(0);
    expect(countSpecialSquares(2, allTypes(true), 0.2)).toBe(0);
  });
});

describe("getEnabledSpecialTypes", () => {
  test("solo i tipi spuntati", () => {
    expect(
      getEnabledSpecialTypes({ ...allTypes(false), quiz: true, mime: true }),
    ).toEqual(["mime", "quiz"]);
  });
});

describe("cursore delle caselle speciali", () => {
  test("il numero scelto è quello del tabellone, per ogni lunghezza", () => {
    for (let n = MIN_SQUARES; n <= MAX_SQUARES; n++) {
      for (let count = 0; count <= maxSpecialSquares(n); count++) {
        const pct = percentageForSpecialSquares(n, count) / 100;
        expect(specialSquaresForPercentage(n, pct)).toBe(count);
      }
    }
    const pct = percentageForSpecialSquares(30, 6) / 100;
    expect(specials(generateSquares(30, allTypes(true), pct))).toBe(6);
  });

  test("cambiando il numero di caselle si riscala in proporzione", () => {
    const pct = percentageForSpecialSquares(30, 6) / 100;
    expect(specialSquaresForPercentage(60, pct)).toBe(12);
    expect(specialSquaresForPercentage(15, pct)).toBe(3);
  });

  test("massimo: tutte tranne START e fine; zero se le caselle non sono valide", () => {
    expect(maxSpecialSquares(30)).toBe(28);
    expect(maxSpecialSquares(Number.NaN)).toBe(0);
    expect(percentageForSpecialSquares(0, 3)).toBe(0);
  });
});
