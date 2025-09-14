import { describe, expect, test } from "vitest";
import {
  BackWriteSquare,
  GoToStartSquare,
  MimeSquare,
  MoveSquare,
  MusicEmotionSquare,
  PhysicalTestSquare,
  SpecialSquare,
  Square,
  WhatWouldYouDoSquare,
} from "../../src/model/square";
import { squareFromJSON } from "../../src/model/square/square-builder";

describe("Square", () => {
  test("Get number, get id", () => {
    const square = new Square(0);
    expect(square.getNumber()).toBe(0);
  });

  test("toJSON", () => {
    const square = new Square(5);
    const json = square.toJSON();
    expect(json).toEqual({ number: 5, type: "normal" });
  });

  test("Move Square", () => {
    const square = new MoveSquare(0, 1);
    expect(square.getNumber()).toBe(0);
    expect(square).toBeInstanceOf(SpecialSquare);
    expect(square.getValue()).toBe(1);
  });

  test("Move Square toJSON", () => {
    const square = new MoveSquare(0, 1);
    const json = square.toJSON();
    expect(json).toEqual({ number: 0, type: "move", moveValue: 1 });
  });

  test("GoToStart Square", () => {
    const square = new GoToStartSquare(10);
    expect(square.getNumber()).toBe(10);
    expect(square).toBeInstanceOf(SpecialSquare);
    expect(square).toBeInstanceOf(MoveSquare);
    expect(square.getValue()).toBe(-10);
  });
});

describe("squareFromJSON", () => {
  test("creates normal Square", () => {
    const json = { number: 5, type: "normal" as const };
    const square = squareFromJSON(json);
    expect(square).toBeInstanceOf(Square);
    expect(square.getNumber()).toBe(5);
    expect(square.getType()).toBe("normal");
  });

  test("creates MimeSquare", () => {
    const json = { number: 10, type: "mime" as const };
    const square = squareFromJSON(json);
    expect(square).toBeInstanceOf(MimeSquare);
    expect(square.getNumber()).toBe(10);
    expect(square.getType()).toBe("mime");
  });

  test("creates QuizSquare", () => {
    const json = { number: 15, type: "quiz" as const };
    const square = squareFromJSON(json);
    expect(square).toBeInstanceOf(SpecialSquare);
    expect(square.getNumber()).toBe(15);
    expect(square.getType()).toBe("quiz");
  });

  test("creates MoveSquare", () => {
    const json = { number: 20, type: "move" as const, moveValue: 5 };
    const square = squareFromJSON(json);
    expect(square).toBeInstanceOf(MoveSquare);
    expect(square.getNumber()).toBe(20);
    expect(square.getType()).toBe("move");
    expect((square as MoveSquare).getValue()).toBe(5);
  });

  test("creates BackWriteSquare", () => {
    const json = { number: 12, type: "backwrite" as const };
    const square = squareFromJSON(json);
    expect(square).toBeInstanceOf(BackWriteSquare);
    expect(square.getNumber()).toBe(12);
    expect(square.getType()).toBe("backwrite");
  });

  test("creates MusicEmotionSquare", () => {
    const json = { number: 13, type: "music-emotion" as const };
    const square = squareFromJSON(json);
    expect(square).toBeInstanceOf(MusicEmotionSquare);
    expect(square.getNumber()).toBe(13);
    expect(square.getType()).toBe("music-emotion");
  });

  test("creates PhysicalTestSquare", () => {
    const json = { number: 14, type: "physical-test" as const };
    const square = squareFromJSON(json);
    expect(square).toBeInstanceOf(PhysicalTestSquare);
    expect(square.getNumber()).toBe(14);
    expect(square.getType()).toBe("physical-test");
  });

  test("creates WhatWouldYouDoSquare", () => {
    const json = { number: 15, type: "what-would-you-do" as const };
    const square = squareFromJSON(json);
    expect(square).toBeInstanceOf(WhatWouldYouDoSquare);
    expect(square.getNumber()).toBe(15);
    expect(square.getType()).toBe("what-would-you-do");
  });

  test("creates default Square for unknown type", () => {
    // biome-ignore lint: test
    const json = { number: 25, type: "unknown" as any };
    const square = squareFromJSON(json);
    expect(square).toBeInstanceOf(Square);
    expect(square.getNumber()).toBe(25);
    expect(square.getType()).toBe("normal");
  });
});
