import { describe, expect, test } from "vitest";
import { Board } from "@/model/board";
import { Game } from "@/model/game";
import { Player } from "@/model/player";
import {
  BackWrite,
  BackWriteSquare,
  SpecialSquare,
  Square,
} from "../../../src/model/square";
import { squareFromJSON } from "../../../src/model/square/square-builder";

describe("BackWrite square", () => {
  test("BackWrite not solved", () => {
    const square1 = new Square(0);
    const square2 = new Square(2);
    const backWriteSquare = new BackWriteSquare(1);

    const players = ["Renzo", "Lucia"].map((el, i) => new Player(i, el));
    const board = new Board([square1, backWriteSquare, square2], players);
    const game = new Game(board, 1);

    expect(backWriteSquare.getNumber()).toBe(1);
    expect(backWriteSquare).toBeInstanceOf(SpecialSquare);
    const command = backWriteSquare.getCommand();
    expect(command).toBeDefined();

    const backWrite = game.playTurn();
    expect(backWrite.type).toBe("backwrite");

    if (backWrite.data instanceof BackWrite) {
      game.resolveBackWrite(backWrite.data, false);
    }

    const skip = game.getPlayers()[0].mustSkipTurn();
    expect(skip).toBeTruthy();
  });

  test("BackWrite solved", () => {
    const square1 = new Square(0);
    const square2 = new Square(2);
    const backWriteSquare = new BackWriteSquare(1);

    const players = ["Renzo", "Lucia"].map((el, i) => new Player(i, el));
    const board = new Board([square1, backWriteSquare, square2], players);
    const game = new Game(board, 1);

    const renzo = game.getPlayers()[0];
    const lucia = game.getPlayers()[1];
    expect(backWriteSquare.getNumber()).toBe(1);
    expect(backWriteSquare).toBeInstanceOf(SpecialSquare);
    const command = backWriteSquare.getCommand();
    expect(command).toBeDefined();

    const backWrite = game.playTurn();
    expect(backWrite.type).toBe("backwrite");

    if (backWrite.data instanceof BackWrite) {
      game.resolveBackWrite(backWrite.data, true, lucia);
    }

    const skip = renzo.mustSkipTurn();
    expect(skip).toBeFalsy();
    expect(game.getPlayerPosition(renzo)).toBe(2);
    expect(game.getPlayerPosition(lucia)).toBe(1);
  });

  test("BackWrite square creation from JSON", () => {
    const json = { number: 12, type: "backwrite" as const };
    const square = squareFromJSON(json);
    expect(square).toBeInstanceOf(BackWriteSquare);
    expect(square.getNumber()).toBe(12);
    expect(square.getType()).toBe("backwrite");
  });

  test("BackWrite deck integration", () => {
    const square1 = new Square(0);
    const backWriteSquare = new BackWriteSquare(1);
    const square2 = new Square(2);

    const players = ["Renzo"].map((el, i) => new Player(i, el));
    const board = new Board([square1, backWriteSquare, square2], players);
    const game = new Game(board, 1);

    const backWrite = game.playTurn();
    expect(backWrite.type).toBe("backwrite");

    if (backWrite.data instanceof BackWrite) {
      expect(backWrite.data.cardTopic).toBeDefined();
      expect(backWrite.data.cardTopic.cardTitle).toBeDefined();
      expect(typeof backWrite.data.cardTopic.cardTitle).toBe("string");
    }
  });
});
