import { describe, expect, test } from "vitest";
import { Board } from "@/model/board";
import { Game } from "@/model/game";
import { Player } from "@/model/player";
import {
  Mime,
  MimeSquare,
  SpecialSquare,
  Square,
} from "../../../src/model/square";
import { squareFromJSON } from "../../../src/model/square/square-builder";

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

  test("Mime square creation from JSON", () => {
    const json = { number: 10, type: "mime" as const };
    const square = squareFromJSON(json);
    expect(square).toBeInstanceOf(MimeSquare);
    expect(square.getNumber()).toBe(10);
    expect(square.getType()).toBe("mime");
  });

  test("Mime deck integration", () => {
    const square1 = new Square(0);
    const mimeSquare = new MimeSquare(1);
    const square2 = new Square(2);

    const players = ["Renzo"].map((el, i) => new Player(i, el));
    const board = new Board([square1, mimeSquare, square2], players);
    const game = new Game(board, 1);

    const mime = game.playTurn();
    expect(mime.type).toBe("mime");

    if (mime.data instanceof Mime) {
      expect(mime.data.cardTopic).toBeDefined();
      expect(mime.data.cardTopic.cardTitle).toBeDefined();
      expect(typeof mime.data.cardTopic.cardTitle).toBe("string");
    }
  });
});
