import { describe, expect, test } from "vitest";
import { Player } from "@/model/player";

describe("Player", () => {
  test("Name and id", () => {
    const player = new Player(0, "Samuel");
    expect(player.getName()).toBe("Samuel");
    expect(player.getId()).toBe(0);
  });

  test("getTurnsToSkip", () => {
    const player = new Player(0, "Samuel");
    expect(player.getTurnsToSkip()).toBe(0);
    player.skipNextTurn(2);
    expect(player.getTurnsToSkip()).toBe(2);
  });

  test("setTurnsToSkip", () => {
    const player = new Player(0, "Samuel");
    player.setTurnsToSkip(3);
    expect(player.getTurnsToSkip()).toBe(3);
  });

  test("Skip turn true", () => {
    const player = new Player(0, "Samuel");
    player.skipNextTurn();
    const skip = player.mustSkipTurn();
    expect(skip).toBeTruthy();
  });

  test("Skip turn false", () => {
    const player = new Player(0, "Samuel");
    const skip = player.mustSkipTurn();
    expect(skip).toBeFalsy();
  });

  test("Skip multiple turns", () => {
    const player = new Player(0, "Samuel");
    player.skipNextTurn(2);
    expect(player.mustSkipTurn()).toBeTruthy();
    expect(player.mustSkipTurn()).toBeTruthy();
    expect(player.mustSkipTurn()).toBeFalsy();
  });
});
