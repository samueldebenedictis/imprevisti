import { beforeEach, describe, expect, test } from "vitest";
import { configUsesFaceEmotion } from "@/lib/faces-client";
import { squaresForFaceSet } from "@/model/deck/emotion-video";
import type { SquareJSON } from "@/model/square/square";
import { useConfigStore } from "@/store/config-store";
import { useGameStore } from "@/store/game-store";

const board = (types: SquareJSON["type"][]): SquareJSON[] =>
  types.map((type, number) => ({ number, type }));

const types = (faceEmotion: boolean, emotionVideo: boolean) => ({
  "face-emotion": faceEmotion,
  "emotion-video": emotionVideo,
});

describe("configUsesFaceEmotion", () => {
  test("tabellone generato: basta una delle due sfide spuntata", () => {
    const base = { numSquares: 30, customSquares: null };
    expect(
      configUsesFaceEmotion({ ...base, squareTypes: types(true, false) }),
    ).toBe(true);
    expect(
      configUsesFaceEmotion({ ...base, squareTypes: types(false, true) }),
    ).toBe(true);
    expect(
      configUsesFaceEmotion({ ...base, squareTypes: types(false, false) }),
    ).toBe(false);
  });

  test("tabellone personalizzato: conta solo se contiene una delle sfide", () => {
    const squareTypes = types(true, true);
    expect(
      configUsesFaceEmotion({
        numSquares: 3,
        squareTypes,
        customSquares: board(["normal", "quiz", "normal"]),
      }),
    ).toBe(false);
    for (const type of ["face-emotion", "emotion-video"] as const) {
      expect(
        configUsesFaceEmotion({
          numSquares: 3,
          squareTypes: types(false, false),
          customSquares: board(["normal", type, "normal"]),
        }),
      ).toBe(true);
    }
  });

  test("tabellone personalizzato di lunghezza diversa: valgono le caselle spuntate", () => {
    expect(
      configUsesFaceEmotion({
        numSquares: 30,
        squareTypes: types(false, false),
        customSquares: board(["normal", "face-emotion", "normal"]),
      }),
    ).toBe(false);
  });
});

describe("squaresForFaceSet", () => {
  const squares: SquareJSON[] = [
    { number: 0, type: "normal" },
    { number: 1, type: "emotion-video" },
    { number: 2, type: "move", moveValue: 2 },
    { number: 3, type: "face-emotion" },
  ];

  test("con il codice le caselle restano uguali", () => {
    expect(squaresForFaceSet(squares, "faces")).toBe(squares);
  });

  test("senza codice le clip diventano Indovina l'emozione", () => {
    expect(squaresForFaceSet(squares, "ai")).toEqual([
      { number: 0, type: "normal" },
      { number: 1, type: "face-emotion" },
      { number: 2, type: "move", moveValue: 2 },
      { number: 3, type: "face-emotion" },
    ]);
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
    actions.setNumSquares(10);
    actions.setCustomSquares(
      board([
        "normal",
        "emotion-video",
        "face-emotion",
        "normal",
        "normal",
        "normal",
        "normal",
        "normal",
        "normal",
        "normal",
      ]),
    );
    actions.createGame();
    const game = useGameStore.getState().game;
    return {
      game,
      types: game
        ?.getBoard()
        .getSquares()
        .map((s) => s.getType()),
    };
  };

  test("di default volti illustrati, senza clip", () => {
    expect(useConfigStore.getState().faceSet).toBe("ai");
    const { game, types } = createGame();
    expect(game?.getFaceSet()).toBe("ai");
    expect(types?.slice(1, 3)).toEqual(["face-emotion", "face-emotion"]);
  });

  test("con il codice: fotografie FACES e clip", () => {
    useConfigStore.getState().actions.setFaceSet("faces");
    const { game, types } = createGame();
    expect(game?.getFaceSet()).toBe("faces");
    expect(game?.toJSON().faceSet).toBe("faces");
    expect(types?.slice(1, 3)).toEqual(["emotion-video", "face-emotion"]);
  });
});
