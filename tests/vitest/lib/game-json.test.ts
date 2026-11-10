import { describe, expect, it } from "vitest";
import { validateGameJSON } from "@/lib/game-json";
import { Board } from "@/model/board";
import { Game, type GameJSON } from "@/model/game";
import { Player } from "@/model/player";
import { MoveSquare, QuizSquare, Square } from "@/model/square";

function validGame(): GameJSON {
  const squares = Array.from({ length: 10 }, (_, i) =>
    i === 3
      ? new QuizSquare(i)
      : i === 5
        ? new MoveSquare(i, -2)
        : new Square(i),
  );
  const players = [new Player(0, "Alice"), new Player(1, "Bob")];
  return new Game(new Board(squares, players)).toJSON();
}

describe("validateGameJSON", () => {
  it("accepts a game serialized by Game.toJSON()", () => {
    expect(validateGameJSON(validGame())).toBeNull();
  });

  it("accepts an ended game with a winner", () => {
    const g = validGame();
    g.gameEnded = true;
    g.winnerId = 1;
    expect(validateGameJSON(g)).toBeNull();
  });

  it.each([null, 42, "partita", []])("rejects a non-object (%s)", (raw) => {
    expect(validateGameJSON(raw)).not.toBeNull();
  });

  it("rejects too few players", () => {
    const g = validGame();
    g.players = g.players.slice(0, 1);
    g.board.playersPosition = g.board.playersPosition.slice(0, 1);
    expect(validateGameJSON(g)).toMatch(/giocatori/);
  });

  it("rejects duplicated player ids", () => {
    const g = validGame();
    g.players[1].id = 0;
    expect(validateGameJSON(g)).toMatch(/ripetuto/);
  });

  it("rejects an empty player name", () => {
    const g = validGame();
    g.players[0].name = "  ";
    expect(validateGameJSON(g)).toMatch(/giocatore/);
  });

  it("rejects a board shorter than the minimum", () => {
    const g = validGame();
    g.board.squares = g.board.squares.slice(0, 5);
    expect(validateGameJSON(g)).toMatch(/caselle/);
  });

  it("rejects an unknown square type", () => {
    const g = validGame();
    (g.board.squares[2] as { type: string }).type = "teleport";
    expect(validateGameJSON(g)).toMatch(/casella/);
  });

  it("rejects squares out of order", () => {
    const g = validGame();
    g.board.squares[4].number = 7;
    expect(validateGameJSON(g)).toMatch(/casella/);
  });

  it("rejects a move value out of range", () => {
    const g = validGame();
    g.board.squares[5].moveValue = 9;
    expect(validateGameJSON(g)).toMatch(/casella/);
  });

  it("rejects a position outside the board", () => {
    const g = validGame();
    g.board.playersPosition[0].position = 10;
    expect(validateGameJSON(g)).toMatch(/posizioni/);
  });

  it("rejects a position for an unknown player", () => {
    const g = validGame();
    g.board.playersPosition[1].playerId = 7;
    expect(validateGameJSON(g)).toMatch(/posizioni/);
  });

  it("rejects a turn that does not exist", () => {
    const g = validGame();
    g.currentTurn = 2;
    expect(validateGameJSON(g)).toMatch(/turno/);
  });

  it("rejects a round lower than 1", () => {
    const g = validGame();
    g.currentRound = 0;
    expect(validateGameJSON(g)).toMatch(/round/);
  });

  it("rejects an unknown winner", () => {
    const g = validGame();
    g.winnerId = 5;
    expect(validateGameJSON(g)).toMatch(/vincitore/);
  });

  it("rejects an ended game without a winner", () => {
    const g = validGame();
    g.gameEnded = true;
    expect(validateGameJSON(g)).toMatch(/vincitore/);
  });

  it("rejects a non-boolean battlesEnabled", () => {
    const g = { ...validGame(), battlesEnabled: "sì" };
    expect(validateGameJSON(g)).toMatch(/battlesEnabled/);
  });
});
