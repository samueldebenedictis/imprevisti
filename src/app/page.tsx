"use client";
import { Game } from "@/model/game";
import { Square } from "@/model/square";
import Board from "./components/board";
import SquareC from "./components/square";

export default function Home() {
  const a = Array.from(Array(20).keys());
  const squares = a.map((_e, i) => {
    return new Square(i);
  });
  const game = new Game(squares, ["Renzo", "Lucia"]);
  game.playTurn();
  const squaresC = game
    .getBoard()
    .getSquares()
    .map((el, index) =>
      SquareC({
        number: el.getNumber(),
        squareType: "normal",
        playersOn: game
          .getBoard()
          .getPlayersOnSquare(index)
          .map((el) => el.getName()),
      }),
    );
  return (
    <div className="flex">
      {Board({
        squares: squaresC,
        cols: 5,
      })}
    </div>
  );
}
