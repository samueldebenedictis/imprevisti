import { describe, expect, test } from "vitest";
import { Board } from "@/model/board";
import { Game } from "@/model/game";
import { Player } from "@/model/player";
import {
  DictationDraw,
  DictationDrawSquare,
  SpecialSquare,
  Square,
} from "../../../src/model/square";
import { squareFromJSON } from "../../../src/model/square/square-builder";

describe("Dictation draw square", () => {
  test("Dictation draw not solved", () => {
    const square1 = new Square(0);
    const square2 = new Square(2);
    const dictationDrawSquare = new DictationDrawSquare(1);

    const players = ["Renzo", "Lucia"].map((el, i) => new Player(i, el));
    const board = new Board([square1, dictationDrawSquare, square2], players);
    const game = new Game(board, 1);

    expect(dictationDrawSquare.getNumber()).toBe(1);
    expect(dictationDrawSquare).toBeInstanceOf(SpecialSquare);
    const command = dictationDrawSquare.getCommand();
    expect(command).toBeDefined();

    const dictationDraw = game.playTurn();
    expect(dictationDraw.type).toBe("dictation-draw");

    if (dictationDraw.data instanceof DictationDraw) {
      game.resolveDictationDraw(dictationDraw.data, false);
    }

    const skip = game.getPlayers()[0].mustSkipTurn();
    expect(skip).toBeTruthy();
  });

  test("Dictation draw solved", () => {
    const square1 = new Square(0);
    const square2 = new Square(2);
    const dictationDrawSquare = new DictationDrawSquare(1);

    const players = ["Renzo", "Lucia"].map((el, i) => new Player(i, el));
    const board = new Board([square1, dictationDrawSquare, square2], players);
    const game = new Game(board, 1);

    const renzo = game.getPlayers()[0];
    const lucia = game.getPlayers()[1];
    expect(dictationDrawSquare.getNumber()).toBe(1);
    expect(dictationDrawSquare).toBeInstanceOf(SpecialSquare);
    const command = dictationDrawSquare.getCommand();
    expect(command).toBeDefined();

    const dictationDraw = game.playTurn();
    expect(dictationDraw.type).toBe("dictation-draw");

    if (dictationDraw.data instanceof DictationDraw) {
      game.resolveDictationDraw(dictationDraw.data, true, lucia);
    }

    const skip = renzo.mustSkipTurn();
    expect(skip).toBeFalsy();
    expect(game.getPlayerPosition(renzo)).toBe(2);
    expect(game.getPlayerPosition(lucia)).toBe(1);
  });

  test("Dictation draw square creation from JSON", () => {
    const json = { number: 10, type: "dictation-draw" as const };
    const square = squareFromJSON(json);
    expect(square).toBeInstanceOf(DictationDrawSquare);
    expect(square.getNumber()).toBe(10);
    expect(square.getType()).toBe("dictation-draw");
  });

  test("Dictation draw deck integration", () => {
    const square1 = new Square(0);
    const dictationDrawSquare = new DictationDrawSquare(1);
    const square2 = new Square(2);

    const players = ["Renzo"].map((el, i) => new Player(i, el));
    const board = new Board([square1, dictationDrawSquare, square2], players);
    const game = new Game(board, 1);

    const dictationDraw = game.playTurn();
    expect(dictationDraw.type).toBe("dictation-draw");

    if (dictationDraw.data instanceof DictationDraw) {
      expect(dictationDraw.data.cardTopic).toBeDefined();
      expect(dictationDraw.data.cardTopic.cardTitle).toBeDefined();
      expect(typeof dictationDraw.data.cardTopic.cardTitle).toBe("string");
      expect(dictationDraw.data.imageUrl).toBeDefined();
      expect(typeof dictationDraw.data.imageUrl).toBe("string");
    }
  });

  test("Dictation draw with image URL", () => {
    const square1 = new Square(0);
    const dictationDrawSquare = new DictationDrawSquare(1);
    const square2 = new Square(2);

    const players = ["Renzo", "Lucia"].map((el, i) => new Player(i, el));
    const board = new Board([square1, dictationDrawSquare, square2], players);
    const game = new Game(board, 1);

    const dictationDraw = game.playTurn();
    expect(dictationDraw.type).toBe("dictation-draw");

    if (dictationDraw.data instanceof DictationDraw) {
      expect(dictationDraw.data.imageUrl).toBeDefined();
      expect(dictationDraw.data.imageUrl).toMatch(
        /^\/images\/dictation-draw\//,
      );
      expect(dictationDraw.data.imageUrl).toMatch(/\.svg$/);
    }
  });

  test("Dictation draw manager integration", () => {
    const square1 = new Square(0);
    const dictationDrawSquare = new DictationDrawSquare(1);
    const square2 = new Square(2);

    const players = ["Renzo", "Lucia"].map((el, i) => new Player(i, el));
    const board = new Board([square1, dictationDrawSquare, square2], players);
    const game = new Game(board, 1);

    const renzo = game.getPlayers()[0];
    const lucia = game.getPlayers()[1];

    const dictationDraw = game.playTurn();
    expect(dictationDraw.type).toBe("dictation-draw");

    if (dictationDraw.data instanceof DictationDraw) {
      const [collision1, collision2] = game.resolveDictationDraw(
        dictationDraw.data,
        true,
        lucia,
      );
      expect(collision1).toBeNull();
      expect(collision2).toBeNull();
      expect(game.getPlayerPosition(renzo)).toBe(2);
      expect(game.getPlayerPosition(lucia)).toBe(1);
    }
  });
});
