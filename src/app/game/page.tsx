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

  const [game, setGame] = useState(new Game(squares, ["Renzo", "Lucia"]));

  // Variabili di gioco
  // const [nomiGiocatori, setNomiGiocatori] = useState(["", ""]);
  // const [iconeGiocatori, setIconeGiocatori] = useState(["", ""]);

  // const [caricamentoEffettuato, setCaricamentoEffettuato] = useState(false);
  const [counter, setCount] = useState(0);

  function onButtonGiocaTurnoClick() {
    // if (localStorage.getItem("istanzaGioco") == undefined) {
    //   throw new Error(
    //     "Impossibile giocare un turno poichè l'istanza corrente non esiste!"
    //   );
    // }

    game.playTurn();
    // setScore(lancioDiDado);
    setCount(counter + 1);
    setGame(game);
    // console.log(giocoAggiornato);
    localStorage.setItem("COUNTER", `${counter}`);
    // localStorage.setItem("istanzaGioco", JSON.stringify(giocoAggiornato));
  }

  useEffect(() => {
    localStorage.setItem(GAME_INSTANCE_KEY, JSON.stringify(game));

    // const _istanzaGiocoObject = JSON.parse(
    //   localStorage.getItem(GAME_INSTANCE_KEY) as string,
    // );

    // console.log(JSON.stringify(game));
    // console.log(JSON.stringify(istanzaGiocoObject));

    // setGame(new Game(squares, ["Renzo", "Lucia"]));
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
