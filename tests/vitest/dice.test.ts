import { describe, expect, test, vi } from "vitest";
import { Dice } from "@/model/dice";

const RANDOM_TEST_NUMBER = 100;

describe("Dice", () => {
  test("Build", () => {
    const dice = new Dice(10);

    const value = dice.roll();
    expect(value).toBeLessThanOrEqual(10);
    expect(value).toBeGreaterThan(0);
  });

  test("Random roll", () => {
    const dice = new Dice(6);

    for (let i = 0; i++; i < RANDOM_TEST_NUMBER) {
      const value = dice.roll();
      expect(value).toBeLessThanOrEqual(6);
      expect(value).toBeGreaterThan(0);
    }
  });

  test("Mocked roll", () => {
    const dice = new Dice(6);
    const rollSpy = vi.spyOn(dice, "roll").mockReturnValue(1);

    expect(dice.roll()).toBe(1);
    expect(dice.roll()).toBe(1);
    expect(rollSpy).toHaveBeenCalledTimes(2);

    rollSpy.mockRestore();
  });
});
