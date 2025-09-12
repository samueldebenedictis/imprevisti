import { describe, expect, test } from "vitest";
import { Board } from "@/model/board";
import { Player } from "@/model/player";
import { Game } from "../../src/model/game";
import {
  Draw,
  DrawSquare,
  SpecialSquare,
  Square,
} from "../../src/model/square";

describe("Draw square", () => {
  test("Draw not solved", () => {
    const square1 = new Square(0);
    const square2 = new Square(2);
    const drawSquare = new DrawSquare(1);

    const players = ["Renzo"].map((el, i) => new Player(i, el));
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
