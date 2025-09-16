import { describe, expect, test } from "vitest";
import { Board } from "@/model/board";
import { Game } from "@/model/game";
import { Player } from "@/model/player";
import {
  PhysicalTest,
  PhysicalTestSquare,
  SpecialSquare,
  Square,
} from "../../../src/model/square";
import { squareFromJSON } from "../../../src/model/square/square-builder";

describe("PhysicalTest square", () => {
  test("PhysicalTest not solved", () => {
    const square1 = new Square(0);
    const square2 = new Square(2);
    const physicalTestSquare = new PhysicalTestSquare(1);

    const players = ["Renzo", "Lucia"].map((el, i) => new Player(i, el));
    const board = new Board([square1, physicalTestSquare, square2], players);
    const game = new Game(board, 1);

    expect(physicalTestSquare.getNumber()).toBe(1);
    expect(physicalTestSquare).toBeInstanceOf(SpecialSquare);
    const command = physicalTestSquare.getCommand();
    expect(command).toBeDefined();

    const physicalTest = game.playTurn();
    expect(physicalTest.type).toBe("physical-test");

    if (physicalTest.data instanceof PhysicalTest) {
      game.resolvePhysicalTest(physicalTest.data, false);
    }

    const skip = game.getPlayers()[0].mustSkipTurn();
    expect(skip).toBeTruthy();
  });

  test("PhysicalTest solved", () => {
    const square1 = new Square(0);
    const square2 = new Square(2);
    const physicalTestSquare = new PhysicalTestSquare(1);

    const players = ["Renzo", "Lucia"].map((el, i) => new Player(i, el));
    const board = new Board([square1, physicalTestSquare, square2], players);
    const game = new Game(board, 1);

    const renzo = game.getPlayers()[0];
    expect(physicalTestSquare.getNumber()).toBe(1);
    expect(physicalTestSquare).toBeInstanceOf(SpecialSquare);
    const command = physicalTestSquare.getCommand();
    expect(command).toBeDefined();

    const physicalTest = game.playTurn();
    expect(physicalTest.type).toBe("physical-test");

    if (physicalTest.data instanceof PhysicalTest) {
      game.resolvePhysicalTest(physicalTest.data, true);
    }

    const skip = renzo.mustSkipTurn();
    expect(skip).toBeFalsy();
    expect(game.getPlayerPosition(renzo)).toBe(2);
  });

  test("PhysicalTest square creation from JSON", () => {
    const json = { number: 14, type: "physical-test" as const };
    const square = squareFromJSON(json);
    expect(square).toBeInstanceOf(PhysicalTestSquare);
    expect(square.getNumber()).toBe(14);
    expect(square.getType()).toBe("physical-test");
  });

  test("PhysicalTest deck integration", () => {
    const square1 = new Square(0);
    const physicalTestSquare = new PhysicalTestSquare(1);
    const square2 = new Square(2);

    const players = ["Renzo"].map((el, i) => new Player(i, el));
    const board = new Board([square1, physicalTestSquare, square2], players);
    const game = new Game(board, 1);

    const physicalTest = game.playTurn();
    expect(physicalTest.type).toBe("physical-test");

    if (physicalTest.data instanceof PhysicalTest) {
      expect(physicalTest.data.cardTest).toBeDefined();
      expect(physicalTest.data.cardTest.cardTitle).toBeDefined();
      expect(typeof physicalTest.data.cardTest.cardTitle).toBe("string");
    }
  });
});
