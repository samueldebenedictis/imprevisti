import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";
import { Board } from "@/model/board";
import { FaceEmotionDeck } from "@/model/deck";
import {
  aiFaceEmotionCards,
  faceEmotionCards,
  faceEmotionCardsFor,
} from "@/model/deck/face-emotion";
import { Game } from "@/model/game";
import { Player } from "@/model/player";
import { FaceEmotionSquare, Square } from "@/model/square";

const deckImages = (deck: FaceEmotionDeck) =>
  Array.from({ length: 40 }, () => deck.getImageData(deck.draw())?.imageUrl);

describe("volti illustrati", () => {
  test("36 carte: 6 volti per 6 emozioni", () => {
    expect(aiFaceEmotionCards).toHaveLength(36);
    expect(new Set(aiFaceEmotionCards.map((c) => c.emotion))).toEqual(
      new Set([
        "felicità",
        "rabbia",
        "tristezza",
        "sorpresa",
        "paura",
        "stanchezza",
      ]),
    );
  });

  test("ogni immagine esiste tra i file pubblici", () => {
    for (const { imageUrl } of aiFaceEmotionCards) {
      expect(existsSync(path.join("public", imageUrl))).toBe(true);
    }
  });

  test("nessuna fotografia FACES", () => {
    for (const { imageUrl } of aiFaceEmotionCards) {
      expect(imageUrl.startsWith("/api/faces/")).toBe(false);
    }
  });
});

describe("mazzo per set di volti", () => {
  test("faceEmotionCardsFor", () => {
    expect(faceEmotionCardsFor("faces")).toBe(faceEmotionCards);
    expect(faceEmotionCardsFor("ai")).toBe(aiFaceEmotionCards);
  });

  test("di default il mazzo usa i volti illustrati", () => {
    for (const url of deckImages(new FaceEmotionDeck())) {
      expect(url).toMatch(/^\/images\/face-emotion\/.+\.jpg$/);
    }
  });

  test("con le foto FACES le immagini passano dal Route Handler", () => {
    for (const url of deckImages(new FaceEmotionDeck("faces"))) {
      expect(url).toMatch(/^\/api\/faces\/.+\.jpg$/);
    }
  });
});

describe("partita", () => {
  const makeGame = (faceSet?: "faces" | "ai") => {
    const players = [new Player(0, "Lucia"), new Player(1, "Renzo")];
    const squares = Array.from({ length: 10 }, (_, i) =>
      i === 1 ? new FaceEmotionSquare(i) : new Square(i),
    );
    return new Game(new Board(squares, players), 6, true, faceSet);
  };

  test("il set di volti resta nel salvataggio", () => {
    const game = makeGame("faces");
    expect(game.getFaceSet()).toBe("faces");
    const restored = Game.fromJSON(game.toJSON());
    expect(restored.getFaceSet()).toBe("faces");
  });

  test("salvataggi senza set di volti: volti illustrati", () => {
    const { faceSet: _, ...old } = makeGame("faces").toJSON();
    expect(Game.fromJSON(old).getFaceSet()).toBe("ai");
    expect(makeGame().getFaceSet()).toBe("ai");
  });
});
