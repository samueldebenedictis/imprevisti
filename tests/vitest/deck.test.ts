import { describe, expect, test } from "vitest";
import { BackWrite } from "@/model/deck/backwrite";
import { BackWriteDeck } from "@/model/deck/backwrite-deck";
import { Card } from "@/model/deck/card";
import { Deck } from "@/model/deck/deck";
import { Player } from "@/model/player";

describe("Deck", () => {
  const cards = [
    new Card("Test 0", "Test 0 description"),
    new Card("Test 1", "Test 1 description"),
    new Card("Test 2", "Test 2 description"),
    new Card("Test 3", "Test 3 description"),
    new Card("Test 4", "Test 4 description"),
    new Card("Test 5", "Test 5 description"),
    new Card("Test 6", "Test 6 description"),
    new Card("Test 7", "Test 7 description"),
    new Card("Test 8", "Test 8 description"),
    new Card("Test 9", "Test 9 description"),
  ];
  test("Build and shuffle", () => {
    const deck = new Deck(cards);
    deck.shuffle();

    // Extract all cards
    const draw = [
      deck.draw(),
      deck.draw(),
      deck.draw(),
      deck.draw(),
      deck.draw(),
      deck.draw(),
      deck.draw(),
      deck.draw(),
      deck.draw(),
      deck.draw(),
    ];

    expect(draw).toHaveLength(10);
    expect(draw).not.toEqual(cards);

    expect(draw.sort((a, b) => a.cardTitle.localeCompare(b.cardTitle)));
    expect(draw).toEqual(cards);
  });

  test("Draw and shuffle", () => {
    const deck = new Deck(cards);
    deck.shuffle();

    expect(deck.cardCount()).toBe(10);

    // Extract all cards
    deck.draw();
    deck.draw();
    deck.draw();
    deck.draw();
    deck.draw();
    deck.draw();
    deck.draw();
    deck.draw();
    deck.draw();
    deck.draw();

    expect(deck.cardCount()).toBe(0);

    deck.draw();
    expect(deck.cardCount()).toBe(9);
  });
});

describe("BackWrite", () => {
  test("creates BackWrite instance", () => {
    const player = new Player(0, "Alice");
    const card = new Card("Casa", "");
    const backWrite = new BackWrite(player, card);

    expect(backWrite.backWritePlayer).toBe(player);
    expect(backWrite.cardTopic).toBe(card);
  });
});

describe("BackWriteDeck", () => {
  test("creates BackWriteDeck with default cards", () => {
    const backWriteDeck = new BackWriteDeck();
    expect(backWriteDeck.cardCount()).toBeGreaterThan(0);
  });

  test("creates BackWriteDeck with custom cards", () => {
    const customCards = [new Card("Custom 1", ""), new Card("Custom 2", "")];
    const backWriteDeck = new BackWriteDeck(customCards);
    expect(backWriteDeck.cardCount()).toBe(2);
  });

  test("draw returns a card", () => {
    const backWriteDeck = new BackWriteDeck();
    const initialCount = backWriteDeck.cardCount();
    const card = backWriteDeck.draw();

    expect(card).toBeInstanceOf(Card);
    expect(backWriteDeck.cardCount()).toBe(initialCount - 1);
  });
});
