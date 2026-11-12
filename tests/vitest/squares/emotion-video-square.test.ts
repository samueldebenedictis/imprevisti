import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { Board } from "@/model/board";
import { Card } from "@/model/deck/card";
import {
  EMOTION_VIDEO_PLACEHOLDER_URL,
  emotionVideoCards,
  emotionVideoFiles,
} from "@/model/deck/emotion-video";
import { EmotionVideoDeck } from "@/model/deck/emotion-video-deck";
import { Game } from "@/model/game";
import { Player } from "@/model/player";
import {
  type CommandDependencies,
  EmotionVideo,
  EmotionVideoSquare,
  SpecialSquare,
  Square,
} from "../../../src/model/square";
import { squareFromJSON } from "../../../src/model/square/square-builder";

function playEmotionVideoTurn() {
  const emotionVideoSquare = new EmotionVideoSquare(1);
  const players = ["Renzo"].map((el, i) => new Player(i, el));
  const board = new Board(
    [new Square(0), emotionVideoSquare, new Square(2)],
    players,
  );
  const game = new Game(board, 1);
  return { game, emotionVideoSquare, renzo: game.getPlayers()[0] };
}

describe("EmotionVideo square", () => {
  test("EmotionVideo not solved", () => {
    const { game, emotionVideoSquare, renzo } = playEmotionVideoTurn();

    expect(emotionVideoSquare.getNumber()).toBe(1);
    expect(emotionVideoSquare).toBeInstanceOf(SpecialSquare);
    expect(emotionVideoSquare.getCommand()).toBeDefined();

    const video = game.playTurn();
    expect(video.type).toBe("emotion-video");

    if (video.data instanceof EmotionVideo) {
      game.resolveEmotionVideo(video.data, false);
    }

    expect(renzo.mustSkipTurn()).toBeTruthy();
  });

  test("EmotionVideo solved", () => {
    const { game, renzo } = playEmotionVideoTurn();

    const video = game.playTurn();
    expect(video.type).toBe("emotion-video");

    if (video.data instanceof EmotionVideo) {
      game.resolveEmotionVideo(video.data, true);
    }

    expect(renzo.mustSkipTurn()).toBeFalsy();
    expect(game.getPlayerPosition(renzo)).toBe(2);
  });

  test("EmotionVideo square creation from JSON", () => {
    const square = squareFromJSON({
      number: 15,
      type: "emotion-video" as const,
    });
    expect(square).toBeInstanceOf(EmotionVideoSquare);
    expect(square.getNumber()).toBe(15);
    expect(square.getType()).toBe("emotion-video");
  });

  test("EmotionVideo deck integration", () => {
    const { game } = playEmotionVideoTurn();

    const video = game.playTurn();
    expect(video.type).toBe("emotion-video");

    if (video.data instanceof EmotionVideo) {
      expect(video.data.cardEmotion.cardTitle).toBeTruthy();
      expect(video.data.videoUrl).toMatch(/^\/api\/faces\/.+_n_[hasdf]\.mp4$/);
    }
  });

  test("EmotionVideo falls back to empty videoUrl when card has no video data", () => {
    const emotionVideoSquare = new EmotionVideoSquare(0);
    const player = new Player(0, "Renzo");
    const deck = new EmotionVideoDeck([new Card("Unknown", "no-match-text")]);

    const result = emotionVideoSquare.getCommand().execute({
      player,
      emotionVideoDeck: deck,
    } as unknown as CommandDependencies);

    expect(result).toBeInstanceOf(EmotionVideo);
    if (result instanceof EmotionVideo) {
      expect(result.videoUrl).toBe("");
    }
  });

  test("30 clip Dynamic FACES: 6 soggetti per 5 emozioni, servite da /api/faces", () => {
    expect(emotionVideoCards).toHaveLength(30);
    expect(new Set(emotionVideoCards.map((card) => card.emotion))).toEqual(
      new Set(["disgusto", "felicità", "paura", "rabbia", "tristezza"]),
    );
    for (const card of emotionVideoCards) {
      expect(card.file).toMatch(/^\d{3}_[yom]_[mf]_n_[hasdf]\.mp4$/);
      expect(card.videoUrl).toBe(`/api/faces/${card.file}`);
    }
    expect(emotionVideoFiles.size).toBe(30);
  });

  test("la clip segnaposto esiste tra i file pubblici", () => {
    expect(
      existsSync(join(process.cwd(), "public", EMOTION_VIDEO_PLACEHOLDER_URL)),
    ).toBe(true);
  });
});
