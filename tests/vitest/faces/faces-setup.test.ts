import { beforeEach, describe, expect, test } from "vitest";

import { configUsesFaceEmotion } from "@/lib/faces-client";
import type { SquareJSON } from "@/model/square/square";
import { useConfigStore } from "@/store/config-store";
import { useGameStore } from "@/store/game-store";

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

describe("volti della partita", () => {
  beforeEach(() => {
    useConfigStore.getState().actions.resetConfig();
  });

  const createGame = () => {
    const { actions } = useConfigStore.getState();
    actions.setPlayerName(0, "Lucia");
    actions.setPlayerName(1, "Renzo");
    actions.createGame();
    return useGameStore.getState().game;
  };

  test("di default volti illustrati", () => {
    expect(useConfigStore.getState().faceSet).toBe("ai");
    expect(createGame()?.getFaceSet()).toBe("ai");
  });

  test("con il codice: fotografie FACES", () => {
    useConfigStore.getState().actions.setFaceSet("faces");
    const game = createGame();
    expect(game?.getFaceSet()).toBe("faces");
    expect(game?.toJSON().faceSet).toBe("faces");
  });
});
