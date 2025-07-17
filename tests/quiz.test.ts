import { describe, expect, test } from "vitest";
import { Card } from "../src/model/card";
import { Game } from "../src/model/game";
import { Quiz, QuizSquare, SpecialSquare, Square } from "../src/model/square";

describe("Quiz square", () => {
  test("Quiz not solved", () => {
    const square = new Square(0);
    const quizSquare = new QuizSquare(1);

    const game = new Game(
      [square, quizSquare],
      ["Renzo"],
      [new Card("Test", "Test")],
      [new Card("Test", "Test")],
      1,
    );

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

  test("Mime solved", () => {
    const square = new Square(0);
    const quizSquare = new QuizSquare(1);

    const game = new Game(
      [square, quizSquare],
      ["Renzo"],
      [new Card("Test", "Test")],
      [new Card("Test", "Test")],
      1,
    );

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
});
