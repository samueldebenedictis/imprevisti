import { describe, expect, test } from "vitest";
import { Board } from "@/model/board";
import { Game } from "@/model/game";
import { Player } from "@/model/player";
import {
  FaceEmotion,
  FaceEmotionSquare,
  SpecialSquare,
  Square,
} from "../../../src/model/square";
import { squareFromJSON } from "../../../src/model/square/square-builder";

describe("Face emotion square", () => {
  test("Face emotion not solved", () => {
    const square1 = new Square(0);
    const square2 = new Square(2);
    const faceEmotionSquare = new FaceEmotionSquare(1);

    const players = ["Renzo"].map((el, i) => new Player(i, el));
    const board = new Board([square1, faceEmotionSquare, square2], players);
    const game = new Game(board, 1);

    expect(faceEmotionSquare.getNumber()).toBe(1);
    expect(faceEmotionSquare).toBeInstanceOf(SpecialSquare);
    const command = faceEmotionSquare.getCommand();
    expect(command).toBeDefined();

    const faceEmotion = game.playTurn();
    expect(faceEmotion.type).toBe("face-emotion");

    if (faceEmotion.data instanceof FaceEmotion) {
      game.resolveFaceEmotion(faceEmotion.data, false);
    }

    const skip = game.getPlayers()[0].mustSkipTurn();
    expect(skip).toBeTruthy();
  });

  test("Face emotion solved", () => {
    const square1 = new Square(0);
    const square2 = new Square(2);
    const faceEmotionSquare = new FaceEmotionSquare(1);

    const players = ["Renzo"].map((el, i) => new Player(i, el));
    const board = new Board([square1, faceEmotionSquare, square2], players);
    const game = new Game(board, 1);

    const renzo = game.getPlayers()[0];
    expect(faceEmotionSquare.getNumber()).toBe(1);
    expect(faceEmotionSquare).toBeInstanceOf(SpecialSquare);
    const command = faceEmotionSquare.getCommand();
    expect(command).toBeDefined();

    const faceEmotion = game.playTurn();
    expect(faceEmotion.type).toBe("face-emotion");

    if (faceEmotion.data instanceof FaceEmotion) {
      game.resolveFaceEmotion(faceEmotion.data, true);
    }

    const skip = renzo.mustSkipTurn();
    expect(skip).toBeFalsy();
    expect(game.getPlayerPosition(renzo)).toBe(2);
  });

  test("Face emotion square creation from JSON", () => {
    const json = { number: 15, type: "face-emotion" as const };
    const square = squareFromJSON(json);
    expect(square).toBeInstanceOf(FaceEmotionSquare);
    expect(square.getNumber()).toBe(15);
    expect(square.getType()).toBe("face-emotion");
  });

  test("Face emotion deck integration", () => {
    const square1 = new Square(0);
    const faceEmotionSquare = new FaceEmotionSquare(1);
    const square2 = new Square(2);

    const players = ["Renzo"].map((el, i) => new Player(i, el));
    const board = new Board([square1, faceEmotionSquare, square2], players);
    const game = new Game(board, 1);

    const faceEmotion = game.playTurn();
    expect(faceEmotion.type).toBe("face-emotion");

    if (faceEmotion.data instanceof FaceEmotion) {
      expect(faceEmotion.data.cardEmotion).toBeDefined();
      expect(faceEmotion.data.cardEmotion.cardTitle).toBeDefined();
      expect(typeof faceEmotion.data.cardEmotion.cardTitle).toBe("string");
      expect(faceEmotion.data.imageUrl).toBeDefined();
      expect(typeof faceEmotion.data.imageUrl).toBe("string");
    }
  });
});
