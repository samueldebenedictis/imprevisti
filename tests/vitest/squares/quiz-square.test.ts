import { describe, expect, test } from "vitest";
import { Board } from "@/model/board";
import { Game } from "@/model/game";
import { Player } from "@/model/player";
import {
  Quiz,
  QuizSquare,
  SpecialSquare,
  Square,
} from "../../../src/model/square";
import { squareFromJSON } from "../../../src/model/square/square-builder";

describe("Quiz square", () => {
  test("Quiz not solved", () => {
    const square1 = new Square(0);
    const square2 = new Square(2);
    const quizSquare = new QuizSquare(1);

    const players = ["Renzo"].map((el, i) => new Player(i, el));
    const board = new Board([square1, quizSquare, square2], players);
    const game = new Game(board, 1);

    expect(quizSquare.getNumber()).toBe(1);
    expect(quizSquare).toBeInstanceOf(SpecialSquare);
    const command = quizSquare.getCommand();
    expect(command).toBeDefined();

    const quiz = game.playTurn();
    expect(quiz.type).toBe("quiz");

    if (quiz.data instanceof Quiz) {
      game.resolveQuiz(quiz.data, false);
    }

    const skip = game.getPlayers()[0].mustSkipTurn();
    expect(skip).toBeTruthy();
  });

  test("Quiz solved", () => {
    const square1 = new Square(0);
    const square2 = new Square(2);
    const quizSquare = new QuizSquare(1);

    const players = ["Renzo"].map((el, i) => new Player(i, el));
    const board = new Board([square1, quizSquare, square2], players);
    const game = new Game(board, 1);

    const renzo = game.getPlayers()[0];
    expect(quizSquare.getNumber()).toBe(1);
    expect(quizSquare).toBeInstanceOf(SpecialSquare);
    const command = quizSquare.getCommand();
    expect(command).toBeDefined();

    const quiz = game.playTurn();
    expect(quiz.type).toBe("quiz");

    if (quiz.data instanceof Quiz) {
      game.resolveQuiz(quiz.data, true);
    }

    const skip = renzo.mustSkipTurn();
    expect(skip).toBeFalsy();
    expect(game.getPlayerPosition(renzo)).toBe(2);
  });

  test("Quiz square creation from JSON", () => {
    const json = { number: 15, type: "quiz" as const };
    const square = squareFromJSON(json);
    expect(square).toBeInstanceOf(QuizSquare);
    expect(square.getNumber()).toBe(15);
    expect(square.getType()).toBe("quiz");
  });

  test("Quiz deck integration", () => {
    const square1 = new Square(0);
    const quizSquare = new QuizSquare(1);
    const square2 = new Square(2);

    const players = ["Renzo"].map((el, i) => new Player(i, el));
    const board = new Board([square1, quizSquare, square2], players);
    const game = new Game(board, 1);

    const quiz = game.playTurn();
    expect(quiz.type).toBe("quiz");

    if (quiz.data instanceof Quiz) {
      expect(quiz.data.cardTopic).toBeDefined();
      expect(quiz.data.cardTopic.cardTitle).toBeDefined();
      expect(typeof quiz.data.cardTopic.cardTitle).toBe("string");
    }
  });
});
