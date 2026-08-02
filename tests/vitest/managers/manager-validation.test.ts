import { describe, expect, test } from "vitest";
import { Board } from "@/model/board";
import { BackWrite } from "@/model/deck/backwrite";
import { Card } from "@/model/deck/card";
import { DictationDraw } from "@/model/deck/dictation-draw";
import { Mime } from "@/model/deck/mime";
import { MusicEmotion } from "@/model/deck/music-emotion";
import { PhysicalTest } from "@/model/deck/physical-test";
import { WhatWouldYouDo } from "@/model/deck/what-would-you-do";
import {
  BackWriteManager,
  DictationDrawManager,
  MimeManager,
  MusicEmotionManager,
  PhysicalTestManager,
  WhatWouldYouDoManager,
} from "@/model/managers";
import { GameStateManager } from "@/model/managers/game-state-manager";
import { MovementManager } from "@/model/managers/movement-manager";
import type { Player } from "@/model/player";
import { Player as PlayerClass } from "@/model/player";
import { Square } from "@/model/square";

function makeMovementManager() {
  const squares = Array.from({ length: 10 }, (_, i) => new Square(i));
  const players = [new PlayerClass(0, "Renzo"), new PlayerClass(1, "Lucia")];
  const board = new Board(squares, players);
  const gameStateManager = new GameStateManager(squares.length);
  return new MovementManager(board, gameStateManager);
}

const card = new Card("Topic", "Text");

describe("Manager isValidX validation", () => {
  test("BackWriteManager.isValidBackWrite", () => {
    const manager = new BackWriteManager(makeMovementManager());
    const player = new PlayerClass(0, "Renzo") as Player;
    expect(manager.isValidBackWrite(new BackWrite(player, card))).toBeTruthy();
    expect(
      manager.isValidBackWrite(
        new BackWrite(undefined as unknown as Player, card),
      ),
    ).toBeFalsy();
  });

  test("MimeManager.isValidMime", () => {
    const manager = new MimeManager(makeMovementManager());
    const player = new PlayerClass(0, "Renzo") as Player;
    expect(manager.isValidMime(new Mime(player, card))).toBeTruthy();
    expect(
      manager.isValidMime(new Mime(undefined as unknown as Player, card)),
    ).toBeFalsy();
  });

  test("DictationDrawManager.isValidDictationDraw", () => {
    const manager = new DictationDrawManager(makeMovementManager());
    const player = new PlayerClass(0, "Renzo") as Player;
    expect(
      manager.isValidDictationDraw(new DictationDraw(player, card, "")),
    ).toBeTruthy();
    expect(
      manager.isValidDictationDraw(
        new DictationDraw(undefined as unknown as Player, card, ""),
      ),
    ).toBeFalsy();
  });

  test("MusicEmotionManager.isValidMusicEmotion", () => {
    const manager = new MusicEmotionManager(makeMovementManager());
    const player = new PlayerClass(0, "Renzo") as Player;
    expect(
      manager.isValidMusicEmotion(new MusicEmotion(player, card)),
    ).toBeTruthy();
    expect(
      manager.isValidMusicEmotion(
        new MusicEmotion(undefined as unknown as Player, card),
      ),
    ).toBeFalsy();
  });

  test("PhysicalTestManager.isValidPhysicalTest", () => {
    const manager = new PhysicalTestManager(makeMovementManager());
    const player = new PlayerClass(0, "Renzo") as Player;
    expect(
      manager.isValidPhysicalTest(new PhysicalTest(player, card)),
    ).toBeTruthy();
    expect(
      manager.isValidPhysicalTest(
        new PhysicalTest(undefined as unknown as Player, card),
      ),
    ).toBeFalsy();
  });

  test("WhatWouldYouDoManager.isValidWhatWouldYouDo", () => {
    const manager = new WhatWouldYouDoManager(makeMovementManager());
    const player = new PlayerClass(0, "Renzo") as Player;
    expect(
      manager.isValidWhatWouldYouDo(new WhatWouldYouDo(player, card)),
    ).toBeTruthy();
    expect(
      manager.isValidWhatWouldYouDo(
        new WhatWouldYouDo(undefined as unknown as Player, card),
      ),
    ).toBeFalsy();
  });
});
