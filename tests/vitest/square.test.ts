import { describe, expect, test } from "vitest";
import { Game } from "@/model/game";
import {
  GoToStartSquare,
  Mime,
  MimeSquare,
  MoveSquare,
  SpecialSquare,
  Square,
} from "../../src/model/square";

describe("Square", () => {
  test("Get number, get id", () => {
    const square = new Square(0);
    expect(square.getNumber()).toBe(0);
  });
  test("Move Square", () => {
    const square = new MoveSquare(0, 1);
    expect(square.getNumber()).toBe(0);
    expect(square).toBeInstanceOf(SpecialSquare);
    expect(square.getValue()).toBe(1);
  });

  test("GoToStart Square", () => {
    const square = new GoToStartSquare(10);
    expect(square.getNumber()).toBe(10);
    expect(square).toBeInstanceOf(SpecialSquare);
    expect(square).toBeInstanceOf(MoveSquare);
    expect(square.getValue()).toBe(-10);
  });
});

describe("Mime square", () => {
  test("Mime not solved", () => {
    const square = new Square(0);
    const mimeSquare = new MimeSquare(1);

    const game = new Game([square, mimeSquare], ["Renzo"], 1);

    expect(mimeSquare.getNumber()).toBe(1);
    expect(mimeSquare).toBeInstanceOf(SpecialSquare);
    const command = mimeSquare.getCommand();
    expect(command).toBeDefined();

    const mime = game.playTurn();
    expect(mime.type).toBe("mime");

    if (mime.data instanceof Mime) {
      game.resolveMime(mime.data, false);
    }

    const skip = game.getPlayers()[0].mustSkipTurn();
    expect(skip).toBeTruthy();
  });

  test("Mime solved", () => {
    const square = new Square(0);
    const mimeSquare = new MimeSquare(1);

    const game = new Game([square, mimeSquare], ["Renzo", "Lucia"], 1);
    const renzo = game.getPlayers()[0];
    const lucia = game.getPlayers()[1];
    expect(mimeSquare.getNumber()).toBe(1);
    expect(mimeSquare).toBeInstanceOf(SpecialSquare);
    const command = mimeSquare.getCommand();
    expect(command).toBeDefined();

    const mime = game.playTurn();
    expect(mime.type).toBe("mime");

    if (mime.data instanceof Mime) {
      game.resolveMime(mime.data, true, lucia);
    }

    const skip = renzo.mustSkipTurn();
    expect(skip).toBeFalsy();
    expect(game.getPlayerPosition(renzo)).toBe(2);
    expect(game.getPlayerPosition(lucia)).toBe(1);
  });
});
