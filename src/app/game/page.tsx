"use client";
import { useEffect, useState } from "react";
import { Game } from "@/model/game";
import { Square } from "@/model/square";
import Board from "../components/board";
import ClientOnly from "../components/client-only";
import SquareC from "../components/square";

export default function Home() {
  const GAME_INSTANCE_KEY = "gameInstance";
  const a = Array.from(Array(20).keys());
  const squares = a.map((_e, i) => {
    return new Square(i);
  });

  const [game, _setGame] = useState(new Game(squares, ["Renzo", "Lucia"]));

  useEffect(() => {
    localStorage.setItem(GAME_INSTANCE_KEY, JSON.stringify(game));

    const _istanzaGiocoObject = JSON.parse(
      localStorage.getItem(GAME_INSTANCE_KEY) as string,
    );

    // console.log(JSON.stringify(game));
    // console.log(JSON.stringify(istanzaGiocoObject));

    // setGame(new Game(squares, ["Renzo", "Lucia"]));
  }, [game]);

  game.playTurn();
  console.log(JSON.stringify(game));
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
    <ClientOnly>
      <div className="mx-auto items-center flex flex-col justify-center">
        {Board({
          squares: squaresC,
          cols: 5,
        })}
      </div>
    </ClientOnly>
  );
}
