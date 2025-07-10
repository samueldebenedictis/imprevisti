import { describe, expect, test } from "vitest";
import { Player } from "@/model/player";

describe("Player", () => {
  test("Name and id", () => {
    const player = new Player(0, "Sam");
    expect(player.getName()).toBe("Sam");
    expect(player.getId()).toBe(0);
  });
});
