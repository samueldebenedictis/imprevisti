import { describe, expect, test } from "vitest";
import { Battle } from "@/model/battle";
import { Player } from "@/model/player";

describe("Battle", () => {
  test("Resolve battle error", () => {
    const player1 = new Player(0, "Lucia");
    const player2 = new Player(1, "Renzo");
    const player3 = new Player(2, "Samuel");
    const battle = new Battle(player1, player2);
    expect(() => battle.resolveBattle(player3)).toThrow();
  });

  test("Get opponent error", () => {
    const player1 = new Player(0, "Lucia");
    const player2 = new Player(1, "Renzo");
    const player3 = new Player(2, "Samuel");
    const battle = new Battle(player1, player2);
    expect(() => battle.getOpponent(player3)).toThrow();
  });

  test("Get opponent", () => {
    const player1 = new Player(0, "Lucia");
    const player2 = new Player(1, "Renzo");
    const battle = new Battle(player1, player2);
    expect(battle.getOpponent(player1)).toStrictEqual(player2);
    expect(battle.getOpponent(player2)).toStrictEqual(player1);
  });

  test("Get players", () => {
    const player1 = new Player(0, "Lucia");
    const player2 = new Player(1, "Renzo");
    const battle = new Battle(player1, player2);
    expect(battle.getPlayers()).toStrictEqual([player1, player2]);
  });
});
