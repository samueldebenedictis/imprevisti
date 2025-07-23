import { Game } from "@/model/game";
import { Square } from "@/model/square";
import Board from "./components/board";
import SquareC from "./components/square";

export default function Home() {
  const squares = [new Square(0), new Square(1), new Square(2), new Square(3)];
  const game = new Game(squares, ["Renzo", "Lucia"]);
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
      })}
    </div>
  );
}
