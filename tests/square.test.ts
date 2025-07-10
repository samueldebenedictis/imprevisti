import { describe, expect, test } from "vitest";
import { MoveSquare, SpecialSquare, Square } from "../src/model/square";

describe("Square", () => {
  test("Get number, get id", () => {
    const square = new Square(0);
    expect(square.getNumber()).toBe(1);
    expect(square.getId()).toBe(0);
  });
  test("Special", () => {
    const square = new MoveSquare(0, 1);
    expect(square.getNumber()).toBe(1);
    expect(square.getId()).toBe(0);
    expect(square).toBeInstanceOf(SpecialSquare);
    expect(square.getValue()).toBe(1);
  });
});
