import { describe, expect, test } from "vitest";
import { Board } from "@/model/board";
import { Game } from "@/model/game";
import { Player } from "@/model/player";
import {
  SpecialSquare,
  Square,
  WhatWouldYouDo,
  WhatWouldYouDoSquare,
} from "../../../src/model/square";
import { squareFromJSON } from "../../../src/model/square/square-builder";

describe("WhatWouldYouDo square", () => {
  test("WhatWouldYouDo not solved", () => {
    const square1 = new Square(0);
    const square2 = new Square(2);
    const whatWouldYouDoSquare = new WhatWouldYouDoSquare(1);

    const players = ["Renzo", "Lucia"].map((el, i) => new Player(i, el));
    const board = new Board([square1, whatWouldYouDoSquare, square2], players);
    const game = new Game(board, 1);

    expect(whatWouldYouDoSquare.getNumber()).toBe(1);
    expect(whatWouldYouDoSquare).toBeInstanceOf(SpecialSquare);
    const command = whatWouldYouDoSquare.getCommand();
    expect(command).toBeDefined();

    const whatWouldYouDo = game.playTurn();
    expect(whatWouldYouDo.type).toBe("what-would-you-do");

    if (whatWouldYouDo.data instanceof WhatWouldYouDo) {
      game.resolveWhatWouldYouDo(whatWouldYouDo.data, false);
    }

    const skip = game.getPlayers()[0].mustSkipTurn();
    expect(skip).toBeTruthy();
  });

  test("WhatWouldYouDo solved", () => {
    const square1 = new Square(0);
    const square2 = new Square(2);
    const whatWouldYouDoSquare = new WhatWouldYouDoSquare(1);

    const players = ["Renzo", "Lucia"].map((el, i) => new Player(i, el));
    const board = new Board([square1, whatWouldYouDoSquare, square2], players);
    const game = new Game(board, 1);

    const renzo = game.getPlayers()[0];
    expect(whatWouldYouDoSquare.getNumber()).toBe(1);
    expect(whatWouldYouDoSquare).toBeInstanceOf(SpecialSquare);
    const command = whatWouldYouDoSquare.getCommand();
    expect(command).toBeDefined();

    const whatWouldYouDo = game.playTurn();
    expect(whatWouldYouDo.type).toBe("what-would-you-do");

    if (whatWouldYouDo.data instanceof WhatWouldYouDo) {
      game.resolveWhatWouldYouDo(whatWouldYouDo.data, true);
    }

    const skip = renzo.mustSkipTurn();
    expect(skip).toBeFalsy();
    expect(game.getPlayerPosition(renzo)).toBe(2);
  });

  test("WhatWouldYouDo square creation from JSON", () => {
    const json = { number: 15, type: "what-would-you-do" as const };
    const square = squareFromJSON(json);
    expect(square).toBeInstanceOf(WhatWouldYouDoSquare);
    expect(square.getNumber()).toBe(15);
    expect(square.getType()).toBe("what-would-you-do");
  });

  test("WhatWouldYouDo deck integration", () => {
    const square1 = new Square(0);
    const whatWouldYouDoSquare = new WhatWouldYouDoSquare(1);
    const square2 = new Square(2);

    const players = ["Renzo"].map((el, i) => new Player(i, el));
    const board = new Board([square1, whatWouldYouDoSquare, square2], players);
    const game = new Game(board, 1);

    const whatWouldYouDo = game.playTurn();
    expect(whatWouldYouDo.type).toBe("what-would-you-do");

    if (whatWouldYouDo.data instanceof WhatWouldYouDo) {
      expect(whatWouldYouDo.data.cardQuestion).toBeDefined();
      expect(whatWouldYouDo.data.cardQuestion.cardTitle).toBeDefined();
      expect(typeof whatWouldYouDo.data.cardQuestion.cardTitle).toBe("string");
    }
  });
});
