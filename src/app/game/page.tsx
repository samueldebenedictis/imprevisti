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

  // var [game, setGame] = useState(new Game([], []));
  var [game, setGame] = useState(new Game(squares, ["re", "lu"]));

  // Variabili di gioco
  const [counter, setCount] = useState(0);

  function onButtonGiocaTurnoClick() {
    game.playTurn();

    setCount(counter + 1);
    setGame(game);
    localStorage.setItem("COUNTER", `${counter}`);
  }

  useEffect(() => {
    const _gameInstance = JSON.parse(
      localStorage.getItem(GAME_INSTANCE_KEY) as string,
    );
    // TODO: convert istanza gioco object to game
    setGame(game);
  }, [game]);

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
      <div>
        <div>
          <button
            type="button"
            onClick={() => {
              // setPlayed(played + 1);
              onButtonGiocaTurnoClick();
            }}
            className="flex h-12 w-full rounded-full bg-black justify-center items-center font-bold text-xl text-yellow-100"
          >
            Gioca un turno
          </button>
        </div>
        <div className="mx-auto items-center flex flex-col justify-center">
          {Board({
            squares: squaresC,
            cols: 5,
          })}
        </div>
      </div>
    </ClientOnly>
  );
}
