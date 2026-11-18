import { describe, expect, test } from "vitest";
import { validateGameJSON } from "@/lib/game-json";
import { Board } from "@/model/board";
import { Card } from "@/model/deck/card";
import { Deck } from "@/model/deck/deck";
import { quizCards } from "@/model/deck/quiz";
import { DECK_IDS, Game, type GameJSON } from "@/model/game";
import { Player } from "@/model/player";
import { QuizSquare, Square } from "@/model/square";

const cards = Array.from({ length: 10 }, (_, i) => new Card(`C${i}`, ""));

/** Deck nuovo che riprende lo stato di `deck`, come dopo un salvataggio. */
const reload = (deck: Deck) => {
  const copy = new Deck(cards);
  expect(copy.restore(JSON.parse(JSON.stringify(deck.toJSON())))).toBe(true);
  return copy;
};

describe("Deck: stato salvabile", () => {
  test("ricaricato a ogni pescata, non ripete carte finché il mazzo non finisce", () => {
    let deck = new Deck(cards);
    const drawn: string[] = [];
    for (let i = 0; i < cards.length; i++) {
      drawn.push(deck.draw().cardTitle);
      deck = reload(deck);
    }
    expect(new Set(drawn).size).toBe(cards.length);
    expect(deck.cardCount()).toBe(0);
  });

  test("al nuovo giro la prima carta non è uguale all'ultima uscita", () => {
    for (let run = 0; run < 200; run++) {
      const deck = new Deck(cards);
      let last = "";
      for (let i = 0; i < cards.length; i++) last = deck.draw().cardTitle;
      expect(reload(deck).draw().cardTitle).not.toBe(last);
    }
  });

  test("con una sola carta continua a pescarla", () => {
    const deck = new Deck([new Card("Unica", "")]);
    expect(deck.draw().cardTitle).toBe("Unica");
    expect(deck.draw().cardTitle).toBe("Unica");
  });

  test.each([
    ["non un oggetto", 42],
    ["pile mancante", {}],
    ["indice fuori misura", { pile: [0, 10] }],
    ["indice negativo", { pile: [-1] }],
    ["indice ripetuto", { pile: [1, 1] }],
    ["indice non intero", { pile: [1.5] }],
    ["ultima carta fuori misura", { pile: [0], last: 99 }],
  ])("ignora uno stato non valido (%s)", (_, state) => {
    const deck = new Deck(cards);
    expect(deck.restore(state)).toBe(false);
    expect(deck.cardCount()).toBe(cards.length);
  });
});

const quizGame = () => {
  const squares = Array.from({ length: 100 }, (_, i) =>
    i === 0 || i === 99 ? new Square(i) : new QuizSquare(i),
  );
  const players = [new Player(0, "Alice"), new Player(1, "Bob")];
  return new Game(new Board(squares, players), 6, false);
};

describe("Game: mazzi nel salvataggio", () => {
  test("toJSON salva tutti i mazzi, fromJSON li riprende uguali", () => {
    const json = quizGame().toJSON();
    expect(Object.keys(json.decks ?? {}).sort()).toEqual([...DECK_IDS].sort());
    expect(json.decks?.quiz?.pile).toHaveLength(quizCards.length);

    const again = Game.fromJSON(JSON.parse(JSON.stringify(json))).toJSON();
    expect(again.decks).toEqual(json.decks);
  });

  test("le domande del quiz non si ripetono tra una ricostruzione e l'altra", () => {
    let game = quizGame();
    const questions: string[] = [];
    while (questions.length < 6 && !game.toJSON().gameEnded) {
      const result = game.playTurn();
      if (result.type === "quiz")
        questions.push(result.data.cardTopic.cardTitle);
      // Come il server multigiocatore: partita ricostruita dopo ogni lancio
      game = Game.fromJSON(JSON.parse(JSON.stringify(game.toJSON())));
    }
    expect(questions.length).toBeGreaterThan(1);
    expect(new Set(questions).size).toBe(questions.length);
  });

  test("un salvataggio senza mazzi (versione precedente) si carica", () => {
    const json: GameJSON = quizGame().toJSON();
    delete json.decks;
    expect(validateGameJSON(json)).toBeNull();
    expect(Game.fromJSON(json).toJSON().decks?.quiz?.pile).toHaveLength(
      quizCards.length,
    );
  });

  test("validateGameJSON accetta i mazzi salvati e rifiuta quelli malformati", () => {
    const json = quizGame().toJSON();
    expect(validateGameJSON(json)).toBeNull();

    for (const decks of [
      [],
      { sconosciuto: { pile: [] } },
      { quiz: { pile: "0,1" } },
      { quiz: { pile: [-1] } },
      { quiz: { pile: [0], last: "x" } },
    ]) {
      expect(
        validateGameJSON({ ...json, decks } as unknown as GameJSON),
      ).toMatch(/mazzi/);
    }
  });
});
