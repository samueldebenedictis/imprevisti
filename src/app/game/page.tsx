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

  const [game, setGame] = useState<Game | null>(null);
  const [counter, setCount] = useState(0);

  useEffect(() => {
    const savedGame = localStorage.getItem(GAME_INSTANCE_KEY);
    if (savedGame) {
      try {
        const parsedGame = JSON.parse(savedGame);
        const loadedGame = Game.fromJSON(parsedGame);
        setGame(loadedGame);
      } catch (e) {
        console.error("Failed to load game from localStorage", e);
        // Se il caricamento fallisce, inizia una nuova partita
        setGame(new Game(squares, ["re", "lu"]));
      }
    } else {
      // Se non c'è un gioco salvato, inizia una nuova partita
      setGame(new Game(squares, ["re", "lu"]));
    }
  }, [squares]); // Esegui solo al mount del componente

  useEffect(() => {
    if (game) {
      localStorage.setItem(GAME_INSTANCE_KEY, JSON.stringify(game));
      localStorage.setItem("COUNTER", `${counter}`);
    }
  }, [game, counter]); // Salva il gioco e il counter ogni volta che cambiano

  function onButtonGiocaTurnoClick() {
    if (game) {
      game.playTurn();
      setCount(counter + 1);
      setGame(game); // Forza un re-render e un salvataggio
    }
  }

  if (!game) {
    return <div>Caricamento gioco...</div>; // O uno spinner di caricamento
  }

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
