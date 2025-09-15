import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { Card } from "@/model/deck/card";
import { dictationDrawImages } from "@/model/deck/dictation-draw";
import { DictationDrawDeck } from "@/model/deck/dictation-draw-deck";

describe("DictationDrawDeck", () => {
  test("DictationDrawDeck initialization", () => {
    const deck = new DictationDrawDeck();
    expect(deck).toBeDefined();
    expect(deck.cardCount()).toBe(dictationDrawImages.length);
  });

  test("DictationDrawDeck getImageData method", () => {
    const deck = new DictationDrawDeck();

    // Draw a card to test with
    const drawnCard = deck.draw();
    const imageData = deck.getImageData(drawnCard);

    expect(imageData).toBeDefined();
    expect(imageData?.name).toBeDefined();
    expect(imageData?.description).toBeDefined();
    expect(imageData?.imageUrl).toBeDefined();
    expect(imageData?.imageUrl).toMatch(/^\/images\/dictation-draw\//);
    expect(imageData?.imageUrl).toMatch(/\.svg$/);
  });

  test("DictationDrawDeck getImageData with invalid card", () => {
    const deck = new DictationDrawDeck();
    const invalidCard = new Card(
      "Invalid Card",
      "This card doesn't match any image",
    );

    const imageData = deck.getImageData(invalidCard);
    expect(imageData).toBeUndefined();
  });

  test("DictationDrawDeck cards have correct format", () => {
    const deck = new DictationDrawDeck();
    const initialCount = deck.cardCount();

    // Draw all cards and check their format
    for (let i = 0; i < initialCount; i++) {
      const card = deck.draw();
      expect(card.cardTitle).toBeDefined();
      expect(typeof card.cardTitle).toBe("string");

      // Check that the card title contains expected elements
      expect(card.cardTitle).toContain(":");
    }
  });

  test("DictationDrawDeck draw method", () => {
    const deck = new DictationDrawDeck();
    const initialCardCount = deck.cardCount();

    const drawnCard = deck.draw();
    expect(drawnCard).toBeDefined();
    expect(drawnCard.cardTitle).toBeDefined();

    // After drawing, the deck should have one less card
    expect(deck.cardCount()).toBe(initialCardCount - 1);
  });

  test("DictationDrawDeck image data consistency", () => {
    const deck = new DictationDrawDeck();
    const initialCount = deck.cardCount();

    // Draw all cards and verify each has corresponding image data
    for (let i = 0; i < initialCount; i++) {
      const card = deck.draw();
      const imageData = deck.getImageData(card);

      expect(imageData).toBeDefined();
      expect(imageData?.name).toBeDefined();
      expect(imageData?.description).toBeDefined();
      expect(imageData?.imageUrl).toBeDefined();

      // Verify the card title contains the image name
      expect(card.cardTitle).toContain(imageData?.name);
    }
  });

  test("Every dictationDrawImages element has its SVG counterpart", () => {
    // Get the public directory path relative to the project root
    const publicDir = join(process.cwd(), "public");

    dictationDrawImages.forEach((image) => {
      // Extract the filename from the imageUrl (e.g., "/images/dictation-draw/house.svg" -> "house.svg")
      const urlParts = image.imageUrl.split("/");
      const filename = urlParts[urlParts.length - 1];

      // Construct the full path to the SVG file
      const svgFilePath = join(publicDir, "images", "dictation-draw", filename);

      // Check if the SVG file exists
      const fileExists = existsSync(svgFilePath);

      expect(fileExists).toBe(true);
    });
  });
});
