import { describe, expect, test, vi } from "vitest";
import { Battle } from "@/model/battle";
import { Card } from "@/model/deck/card";
import { Mime } from "@/model/deck/mime";
import { BattleManager } from "@/model/managers/battle-manager";
import type { MovementManager } from "@/model/managers/movement-manager";
import type { SpecialSquareProcessor } from "@/model/managers/special-square-processor";
import type { TurnManager } from "@/model/managers/turn-manager";
import { Player } from "@/model/player";

function makeBattleManager(overrides: {
  moveWinnerForward: ReturnType<typeof vi.fn>;
  processSquareEffects: ReturnType<typeof vi.fn>;
}) {
  const movementManager = {
    moveWinnerForward: overrides.moveWinnerForward,
  } as unknown as MovementManager;
  const specialSquareProcessor = {
    processSquareEffects: overrides.processSquareEffects,
  } as unknown as SpecialSquareProcessor;
  const turnManager = {
    getPlayers: vi.fn(() => [player1, player2]),
  } as unknown as TurnManager;
  return new BattleManager(
    movementManager,
    specialSquareProcessor,
    turnManager,
  );
}

const player1 = new Player(0, "Renzo");
const player2 = new Player(1, "Lucia");

describe("BattleManager.resolveBattle", () => {
  test("returns none when the winner's move ends the game", () => {
    const processSquareEffects = vi.fn();
    const battleManager = makeBattleManager({
      moveWinnerForward: vi.fn(() => ({ collision: null, gameEnded: true })),
      processSquareEffects,
    });
    const battle = new Battle(player1, player2);

    const result = battleManager.resolveBattle(battle, player1, 4);

    expect(result).toStrictEqual({
      type: "none",
      diceResult: 4,
      actionType: null,
    });
    expect(processSquareEffects).not.toHaveBeenCalled();
  });

  test("returns a new battle when the winner collides again", () => {
    const followUpBattle = new Battle(player1, player2);
    const battleManager = makeBattleManager({
      moveWinnerForward: vi.fn(() => ({
        collision: followUpBattle,
        gameEnded: false,
      })),
      processSquareEffects: vi.fn(),
    });
    const battle = new Battle(player1, player2);

    const result = battleManager.resolveBattle(battle, player1, 3);

    expect(result).toStrictEqual({
      type: "battle",
      data: followUpBattle,
      diceResult: 3,
      actionType: "battle",
    });
  });

  test("returns a mime action when the winner lands on a mime square", () => {
    const mimeAction = new Mime(player1, new Card("Gatto", ""));
    const battleManager = makeBattleManager({
      moveWinnerForward: vi.fn(() => ({ collision: null, gameEnded: false })),
      processSquareEffects: vi.fn(() => mimeAction),
    });
    const battle = new Battle(player1, player2);

    const result = battleManager.resolveBattle(battle, player1, 2);

    expect(result).toStrictEqual({
      type: "mime",
      data: mimeAction,
      diceResult: 2,
      actionType: "mime",
    });
  });

  test("returns none when the winner lands on a normal square", () => {
    const battleManager = makeBattleManager({
      moveWinnerForward: vi.fn(() => ({ collision: null, gameEnded: false })),
      processSquareEffects: vi.fn(() => undefined),
    });
    const battle = new Battle(player1, player2);

    const result = battleManager.resolveBattle(battle, player1, 5);

    expect(result).toStrictEqual({
      type: "none",
      diceResult: 5,
      actionType: null,
    });
  });
});
