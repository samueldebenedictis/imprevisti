import { describe, expect, test } from "vitest";
import { Board } from "@/model/board";
import { Game } from "@/model/game";
import { Player } from "@/model/player";
import {
  MusicEmotion,
  MusicEmotionSquare,
  SpecialSquare,
  Square,
} from "../../../src/model/square";
import { squareFromJSON } from "../../../src/model/square/square-builder";

describe("MusicEmotion square", () => {
  test("MusicEmotion not solved", () => {
    const square1 = new Square(0);
    const square2 = new Square(2);
    const musicEmotionSquare = new MusicEmotionSquare(1);

    const players = ["Renzo", "Lucia"].map((el, i) => new Player(i, el));
    const board = new Board([square1, musicEmotionSquare, square2], players);
    const game = new Game(board, 1);

    expect(musicEmotionSquare.getNumber()).toBe(1);
    expect(musicEmotionSquare).toBeInstanceOf(SpecialSquare);
    const command = musicEmotionSquare.getCommand();
    expect(command).toBeDefined();

    const musicEmotion = game.playTurn();
    expect(musicEmotion.type).toBe("music-emotion");

    if (musicEmotion.data instanceof MusicEmotion) {
      game.resolveMusicEmotion(musicEmotion.data, false);
    }

    const skip = game.getPlayers()[0].mustSkipTurn();
    expect(skip).toBeTruthy();
  });

  test("MusicEmotion solved", () => {
    const square1 = new Square(0);
    const square2 = new Square(2);
    const musicEmotionSquare = new MusicEmotionSquare(1);

    const players = ["Renzo", "Lucia"].map((el, i) => new Player(i, el));
    const board = new Board([square1, musicEmotionSquare, square2], players);
    const game = new Game(board, 1);

    const renzo = game.getPlayers()[0];
    expect(musicEmotionSquare.getNumber()).toBe(1);
    expect(musicEmotionSquare).toBeInstanceOf(SpecialSquare);
    const command = musicEmotionSquare.getCommand();
    expect(command).toBeDefined();

    const musicEmotion = game.playTurn();
    expect(musicEmotion.type).toBe("music-emotion");

    if (musicEmotion.data instanceof MusicEmotion) {
      game.resolveMusicEmotion(musicEmotion.data, true);
    }

    const skip = renzo.mustSkipTurn();
    expect(skip).toBeFalsy();
    expect(game.getPlayerPosition(renzo)).toBe(2);
  });

  test("MusicEmotion square creation from JSON", () => {
    const json = { number: 13, type: "music-emotion" as const };
    const square = squareFromJSON(json);
    expect(square).toBeInstanceOf(MusicEmotionSquare);
    expect(square.getNumber()).toBe(13);
    expect(square.getType()).toBe("music-emotion");
  });

  test("MusicEmotion deck integration", () => {
    const square1 = new Square(0);
    const musicEmotionSquare = new MusicEmotionSquare(1);
    const square2 = new Square(2);

    const players = ["Renzo"].map((el, i) => new Player(i, el));
    const board = new Board([square1, musicEmotionSquare, square2], players);
    const game = new Game(board, 1);

    const musicEmotion = game.playTurn();
    expect(musicEmotion.type).toBe("music-emotion");

    if (musicEmotion.data instanceof MusicEmotion) {
      expect(musicEmotion.data.cardEmotion).toBeDefined();
      expect(musicEmotion.data.cardEmotion.cardTitle).toBeDefined();
      expect(typeof musicEmotion.data.cardEmotion.cardTitle).toBe("string");
    }
  });
});
