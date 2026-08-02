import { describe, expect, test } from "vitest";
import { GameStateManager } from "@/model/managers/game-state-manager";
import { Player } from "@/model/player";

describe("GameStateManager.forceEndGame", () => {
  test("ends the game immediately with the given winner", () => {
    const manager = new GameStateManager(10);
    const winner = new Player(0, "Renzo");

    expect(manager.isGameEnded()).toBeFalsy();

    manager.forceEndGame(winner);

    expect(manager.isGameEnded()).toBeTruthy();
    expect(manager.getWinner()).toBe(winner);
  });
});

describe("GameStateManager.fromJSON", () => {
  test("restores a decided winner from a finished game", () => {
    const players = [new Player(0, "Renzo"), new Player(1, "Lucia")];

    const manager = GameStateManager.fromJSON(10, true, 1, players);

    expect(manager.isGameEnded()).toBeTruthy();
    expect(manager.getWinner()).toBe(players[1]);
  });

  test("leaves the winner undefined when the game has not ended", () => {
    const players = [new Player(0, "Renzo"), new Player(1, "Lucia")];

    const manager = GameStateManager.fromJSON(10, false, undefined, players);

    expect(manager.isGameEnded()).toBeFalsy();
    expect(manager.getWinner()).toBeUndefined();
  });
});
