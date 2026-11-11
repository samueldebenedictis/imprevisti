import { beforeEach, describe, expect, test, vi } from "vitest";

// La sfida è disattivata nel codice: per i test la si considera attiva
vi.mock("@/vars", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/vars")>()),
  FACE_EMOTION_ENABLED: true,
}));

import { configUsesFaceEmotion } from "@/lib/faces-client";
import type { SquareJSON } from "@/model/square/square";
import { useConfigStore } from "@/store/config-store";

const board = (types: SquareJSON["type"][]): SquareJSON[] =>
  types.map((type, number) => ({ number, type }));

describe("configUsesFaceEmotion", () => {
  test("tabellone generato: dipende dalla casella spuntata", () => {
    const base = { numSquares: 30, customSquares: null };
    expect(
      configUsesFaceEmotion({
        ...base,
        squareTypes: { "face-emotion": true },
      }),
    ).toBe(true);
    expect(
      configUsesFaceEmotion({
        ...base,
        squareTypes: { "face-emotion": false },
      }),
    ).toBe(false);
  });

  test("tabellone personalizzato: conta solo se contiene la sfida", () => {
    const squareTypes = { "face-emotion": true };
    expect(
      configUsesFaceEmotion({
        numSquares: 3,
        squareTypes,
        customSquares: board(["normal", "quiz", "normal"]),
      }),
    ).toBe(false);
    expect(
      configUsesFaceEmotion({
        numSquares: 3,
        squareTypes: { "face-emotion": false },
        customSquares: board(["normal", "face-emotion", "normal"]),
      }),
    ).toBe(true);
  });

  test("tabellone personalizzato di lunghezza diversa: vale la casella spuntata", () => {
    expect(
      configUsesFaceEmotion({
        numSquares: 30,
        squareTypes: { "face-emotion": false },
        customSquares: board(["normal", "face-emotion", "normal"]),
      }),
    ).toBe(false);
  });
});

describe("excludeFaceEmotion", () => {
  beforeEach(() => {
    useConfigStore.getState().actions.resetConfig();
  });

  test("toglie la sfida dai tipi di casella", () => {
    const { actions } = useConfigStore.getState();
    actions.setSquareType("face-emotion", true);
    actions.excludeFaceEmotion();
    expect(useConfigStore.getState().squareTypes["face-emotion"]).toBe(false);
  });

  test("trasforma in normali le caselle della sfida nel tabellone personalizzato", () => {
    const { actions } = useConfigStore.getState();
    actions.setCustomSquares([
      { number: 0, type: "normal" },
      { number: 1, type: "face-emotion" },
      { number: 2, type: "move", moveValue: 2 },
      { number: 3, type: "normal" },
    ]);
    actions.excludeFaceEmotion();
    expect(useConfigStore.getState().customSquares).toEqual([
      { number: 0, type: "normal" },
      { number: 1, type: "normal" },
      { number: 2, type: "move", moveValue: 2 },
      { number: 3, type: "normal" },
    ]);
  });

  test("senza tabellone personalizzato resta null", () => {
    useConfigStore.getState().actions.excludeFaceEmotion();
    expect(useConfigStore.getState().customSquares).toBeNull();
  });
});
