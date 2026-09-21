import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { Board } from "@/model/board";
import { Card } from "@/model/deck/card";
import { filmCards } from "@/model/deck/film";
import { FilmDeck } from "@/model/deck/film-deck";
import { Game } from "@/model/game";
import { Player } from "@/model/player";
import {
  type CommandDependencies,
  Film,
  FilmSquare,
  SpecialSquare,
  Square,
} from "../../../src/model/square";
import { squareFromJSON } from "../../../src/model/square/square-builder";

function playFilmTurn() {
  const filmSquare = new FilmSquare(1);
  const players = ["Renzo"].map((el, i) => new Player(i, el));
  const board = new Board([new Square(0), filmSquare, new Square(2)], players);
  const game = new Game(board, 1);
  return { game, filmSquare, renzo: game.getPlayers()[0] };
}

describe("Film square", () => {
  test("Film not solved", () => {
    const { game, filmSquare, renzo } = playFilmTurn();

    expect(filmSquare.getNumber()).toBe(1);
    expect(filmSquare).toBeInstanceOf(SpecialSquare);
    expect(filmSquare.getCommand()).toBeDefined();

    const film = game.playTurn();
    expect(film.type).toBe("film");

    if (film.data instanceof Film) {
      game.resolveFilm(film.data, false);
    }

    expect(renzo.mustSkipTurn()).toBeTruthy();
  });

  test("Film solved", () => {
    const { game, renzo } = playFilmTurn();

    const film = game.playTurn();
    expect(film.type).toBe("film");

    if (film.data instanceof Film) {
      game.resolveFilm(film.data, true);
    }

    expect(renzo.mustSkipTurn()).toBeFalsy();
    expect(game.getPlayerPosition(renzo)).toBe(2);
  });

  test("Film square creation from JSON", () => {
    const square = squareFromJSON({ number: 15, type: "film" as const });
    expect(square).toBeInstanceOf(FilmSquare);
    expect(square.getNumber()).toBe(15);
    expect(square.getType()).toBe("film");
  });

  test("Film deck integration", () => {
    const { game } = playFilmTurn();

    const film = game.playTurn();
    expect(film.type).toBe("film");

    if (film.data instanceof Film) {
      expect(film.data.cardEmotion.cardTitle).toBeTruthy();
      expect(film.data.videoUrl).toMatch(/^\/videos\/.+\.mp4$/);
    }
  });

  test("Film falls back to empty videoUrl when card has no video data", () => {
    const filmSquare = new FilmSquare(0);
    const player = new Player(0, "Renzo");
    const deck = new FilmDeck([new Card("Unknown", "no-match-text")]);

    const result = filmSquare.getCommand().execute({
      player,
      filmDeck: deck,
    } as unknown as CommandDependencies);

    expect(result).toBeInstanceOf(Film);
    if (result instanceof Film) {
      expect(result.videoUrl).toBe("");
    }
  });

  test("Film cards cover the five emotions, each with an existing video", () => {
    expect(filmCards.map((card) => card.emotion).sort()).toEqual(
      ["disgusto", "felicità", "paura", "rabbia", "tristezza"].sort(),
    );
    for (const card of filmCards) {
      expect(existsSync(join(process.cwd(), "public", card.videoUrl))).toBe(
        true,
      );
    }
  });
});
