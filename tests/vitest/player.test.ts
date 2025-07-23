import { describe, expect, test } from "vitest";
import { Player } from "@/model/player";

describe("Player", () => {
  test("Name and id", () => {
    const player = new Player(0, "Samuel");
    expect(player.getName()).toBe("Samuel");
    expect(player.getId()).toBe(0);
  });

  test("Skip turn true", () => {
    const player = new Player(0, "Samuel");
    player.skipNextTurn();
    const skip = player.mustSkipTurn();
    expect(skip).toBeTruthy();
  });

  test("Skip turn true", () => {
    const player = new Player(0, "Samuel");
    const skip = player.mustSkipTurn();
    expect(skip).toBeFalsy();
  });
});
