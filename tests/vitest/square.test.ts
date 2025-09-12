import { describe, expect, test } from "vitest";
import { Board } from "@/model/board";
import { Game } from "@/model/game";
import { Player } from "@/model/player";
import {
  Draw,
  DrawSquare,
  GoToStartSquare,
  Mime,
  MimeSquare,
  MoveSquare,
  SpecialSquare,
  Square,
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

  test("creates DrawSquare", () => {
    const json = { number: 12, type: "draw" as const };
    const square = squareFromJSON(json);
    expect(square).toBeInstanceOf(DrawSquare);
    expect(square.getNumber()).toBe(12);
    expect(square.getType()).toBe("draw");
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

describe("Mime square", () => {
  test("Mime not solved", () => {
    const square1 = new Square(0);
    const square2 = new Square(2);
    const mimeSquare = new MimeSquare(1);

    const players = ["Renzo", "Lucia"].map((el, i) => new Player(i, el));
    const board = new Board([square1, mimeSquare, square2], players);
    const game = new Game(board, 1);

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
    const square1 = new Square(0);
    const square2 = new Square(2);
    const mimeSquare = new MimeSquare(1);

    const players = ["Renzo", "Lucia"].map((el, i) => new Player(i, el));
    const board = new Board([square1, mimeSquare, square2], players);
    const game = new Game(board, 1);

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

describe("Draw square", () => {
  test("Draw not solved", () => {
    const square1 = new Square(0);
    const square2 = new Square(2);
    const drawSquare = new DrawSquare(1);

    const players = ["Renzo", "Lucia"].map((el, i) => new Player(i, el));
    const board = new Board([square1, drawSquare, square2], players);
    const game = new Game(board, 1);

    expect(drawSquare.getNumber()).toBe(1);
    expect(drawSquare).toBeInstanceOf(SpecialSquare);
    const command = drawSquare.getCommand();
    expect(command).toBeDefined();

    const draw = game.playTurn();
    expect(draw.type).toBe("draw");

    if (draw.data instanceof Draw) {
      game.resolveDraw(draw.data, false);
    }

    const skip = game.getPlayers()[0].mustSkipTurn();
    expect(skip).toBeTruthy();
  });

  test("Draw solved", () => {
    const square1 = new Square(0);
    const square2 = new Square(2);
    const drawSquare = new DrawSquare(1);

    const players = ["Renzo", "Lucia"].map((el, i) => new Player(i, el));
    const board = new Board([square1, drawSquare, square2], players);
    const game = new Game(board, 1);

    const renzo = game.getPlayers()[0];
    const lucia = game.getPlayers()[1];
    expect(drawSquare.getNumber()).toBe(1);
    expect(drawSquare).toBeInstanceOf(SpecialSquare);
    const command = drawSquare.getCommand();
    expect(command).toBeDefined();

    const draw = game.playTurn();
    expect(draw.type).toBe("draw");

    if (draw.data instanceof Draw) {
      game.resolveDraw(draw.data, true, lucia);
    }

    const skip = renzo.mustSkipTurn();
    expect(skip).toBeFalsy();
    expect(game.getPlayerPosition(renzo)).toBe(2);
    expect(game.getPlayerPosition(lucia)).toBe(1);
  });
});
