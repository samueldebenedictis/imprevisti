import { describe, expect, test } from "vitest";
import {
  CUSTOM_DECKS_FILE_VERSION,
  customDecksFromFile,
  customDecksToFile,
} from "@/lib/custom-decks-file";
import { validateGameJSON } from "@/lib/game-json";
import { Board } from "@/model/board";
import {
  defaultDeckCards,
  MAX_CUSTOM_CARDS,
  validateCustomDecks,
} from "@/model/deck/custom-decks";
import { Quiz, quizCards } from "@/model/deck/quiz";
import { Game, type GameJSON } from "@/model/game";
import { Player } from "@/model/player";
import { MimeSquare, QuizSquare, Square } from "@/model/square";
import example from "../../docs/custom-decks-example.json";

describe("validateCustomDecks", () => {
  test("accetta nessun mazzo e mazzi validi", () => {
    expect(validateCustomDecks({})).toBeNull();
    expect(
      validateCustomDecks({
        quiz: [{ domanda: "Due più due?", risposta: "Quattro" }],
        mime: ["Gatto"],
      }),
    ).toBeNull();
  });

  test.each([
    ["non un oggetto", []],
    ["mazzo sconosciuto", { volti: ["x"] }],
    ["mazzo vuoto", { mime: [] }],
    ["troppe carte", { mime: Array.from({ length: 201 }, (_, i) => `${i}`) }],
    ["testo vuoto", { mime: ["  "] }],
    ["testo troppo lungo", { mime: ["x".repeat(201)] }],
    ["quiz senza risposta", { quiz: [{ domanda: "Ciao?" }] }],
    ["quiz come testo", { quiz: ["Ciao?"] }],
  ])("rifiuta %s", (_, raw) => {
    expect(validateCustomDecks(raw)).not.toBeNull();
  });
});

describe("file delle domande personalizzate", () => {
  test("esporta tutti i mazzi, predefiniti dove non personalizzati", () => {
    const file = customDecksToFile({ mime: ["Gatto"] });
    expect(file.versione).toBe(CUSTOM_DECKS_FILE_VERSION);
    expect(file.mimo).toEqual(["Gatto"]);
    expect(file.quiz).toEqual(defaultDeckCards().quiz);
    expect(Object.keys(file).sort()).toEqual(
      [
        "versione",
        "quiz",
        "cosaFaresti",
        "mimo",
        "paroleAlleSpalle",
        "emozioniInMusica",
        "proveFisiche",
      ].sort(),
    );
  });

  test("un file esportato si reimporta uguale", () => {
    const decks = {
      quiz: [{ domanda: "Due più due?", risposta: "Quattro" }],
      whatWouldYouDo: ["Cosa faresti se piovesse?"],
    };
    const result = customDecksFromFile(
      JSON.parse(JSON.stringify(customDecksToFile(decks))),
    );
    expect(result).toEqual({
      decks: { ...defaultDeckCards(), ...decks },
    });
  });

  test("toglie spazi e carte ripetute, lascia predefiniti i mazzi assenti", () => {
    expect(
      customDecksFromFile({
        mimo: ["  Gatto ", "Gatto", "Cane"],
        quiz: [
          { domanda: " A? ", risposta: "a" },
          { domanda: "A?", risposta: "a " },
        ],
      }),
    ).toEqual({
      decks: {
        mime: ["Gatto", "Cane"],
        quiz: [{ domanda: "A?", risposta: "a" }],
      },
    });
  });

  test.each([
    ["non un oggetto", "testo", /oggetto JSON/],
    ["versione futura", { versione: 2 }, /versione/],
    ["chiave sbagliata", { mimi: ["Gatto"] }, /chiave sconosciuta: mimi/],
    ["mazzo non elenco", { mimo: "Gatto" }, /mimo: serve un elenco/],
    ["mazzo vuoto", { mimo: [] }, /mimo: nessuna carta/],
    ["testo vuoto", { mimo: ["Gatto", " "] }, /mimo, carta 2: .*vuoto/],
    [
      "quiz senza risposta",
      { quiz: [{ domanda: "A?", risposta: "a" }, { domanda: "B?" }] },
      /quiz, carta 2: manca il testo della risposta/,
    ],
    [
      "testo troppo lungo",
      { proveFisiche: ["x".repeat(201)] },
      /proveFisiche, carta 1: .*200 caratteri/,
    ],
    [
      "troppe carte",
      {
        mimo: Array.from({ length: MAX_CUSTOM_CARDS + 1 }, (_, i) => `${i}`),
      },
      /mimo: al massimo/,
    ],
  ])("errore chiaro: %s", (_, raw, message) => {
    const result = customDecksFromFile(raw);
    expect("error" in result && result.error).toMatch(message);
  });
});

test("il file di esempio in docs/ si importa", () => {
  const result = customDecksFromFile(example);
  expect("decks" in result && Object.keys(result.decks).sort()).toEqual([
    "mime",
    "quiz",
    "whatWouldYouDo",
  ]);
});

describe("Game con carte personalizzate", () => {
  const players = () => [new Player(0, "Alice"), new Player(1, "Bob")];
  const quiz = [{ domanda: "Capitale d'Italia?", risposta: "Roma" }];

  test("pesca dalle carte personalizzate, anche dopo la ricostruzione", () => {
    const squares = Array.from({ length: 100 }, (_, i) =>
      i === 0 || i === 99 ? new Square(i) : new QuizSquare(i),
    );
    let game = new Game(new Board(squares, players()), 6, false, "ai", {
      quiz,
    });
    const drawn: string[] = [];
    while (drawn.length < 3) {
      const result = game.playTurn();
      if (result.data instanceof Quiz)
        drawn.push(
          `${result.data.cardTopic.cardTitle}|${result.data.cardTopic.cardText}`,
        );
      game = Game.fromJSON(JSON.parse(JSON.stringify(game.toJSON())));
    }
    expect(drawn).toEqual(Array(3).fill("Capitale d'Italia?|Roma"));
  });

  test("salva le carte nel JSON solo se ci sono", () => {
    const squares = [
      new Square(0),
      new MimeSquare(1),
      ...Array.from({ length: 8 }, (_, i) => new Square(i + 2)),
    ];
    const plain = new Game(new Board(squares, players())).toJSON();
    expect(plain.customCards).toBeUndefined();
    expect(plain.decks?.quiz?.pile).toHaveLength(quizCards.length);

    const custom = new Game(new Board(squares, players()), 6, true, "ai", {
      quiz,
    }).toJSON();
    expect(custom.customCards).toEqual({ quiz });
    expect(custom.decks?.quiz?.pile).toEqual([0]);
    expect(validateGameJSON(custom)).toBeNull();
  });

  test("validateGameJSON rifiuta carte personalizzate non valide", () => {
    const squares = Array.from({ length: 10 }, (_, i) => new Square(i));
    const json: GameJSON = new Game(new Board(squares, players())).toJSON();
    expect(
      validateGameJSON({ ...json, customCards: { quiz: [] } }),
    ).not.toBeNull();
  });
});
