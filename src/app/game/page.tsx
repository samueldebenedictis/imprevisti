"use client";
import { useEffect, useState } from "react";
import { Board } from "@/model/board";
import { Game as GameModel } from "@/model/game";
import { Player } from "@/model/player";
import { Square } from "@/model/square";
import BoardComponent from "../components/board";
import ClientOnly from "../components/client-only";
import SquareC from "../components/square";

// Forcing re-evaluation
export default function Page() {
  const GAME_INSTANCE_KEY = "gameInstance";

  const [game, setGame] = useState<GameModel | null>(null);
  const [counter, setCount] = useState(0);

  useEffect(() => {
    const savedGame = localStorage.getItem(GAME_INSTANCE_KEY);
    if (savedGame) {
      try {
        const parsedGame = JSON.parse(savedGame);
        const loadedGame = GameModel.fromJSON(parsedGame);
        setGame(loadedGame);
      } catch (e) {
        console.error("Failed to load game from localStorage", e);
        // Se il caricamento fallisce, inizia una nuova partita
        const initialPlayers = ["re", "lu"].map(
          (name, i) => new Player(i, name),
        );
        const squares = Array.from(Array(20).keys()).map((_e, i) => {
          return new Square(i);
        });
        const initialBoard = new Board(squares, initialPlayers);
        setGame(new GameModel(initialBoard, initialPlayers));
      }
    } else {
      // Se non c'è un gioco salvato, inizia una nuova partita
      const squares = Array.from(Array(20).keys()).map((_e, i) => {
        return new Square(i);
      });
      const initialPlayers = ["re", "lu"].map((name, i) => new Player(i, name));
      const initialBoard = new Board(squares, initialPlayers);
      setGame(new GameModel(initialBoard, initialPlayers));
    }
  }, []); // Esegui solo al mount del componente

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
      // Serialize the current game state to JSON, then deserialize it to create a new Game instance
      const updatedGameJSON = game.toJSON();
      const updatedGame = GameModel.fromJSON(updatedGameJSON);
      setGame(updatedGame); // Set the new instance to trigger re-render and saving
    }
  }

  if (!game) {
    return <div>Caricamento gioco...</div>; // O uno spinner di caricamento
  }

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
          {BoardComponent({
            squares: squaresC,
            cols: 5,
          })}
        </div>
      </div>
    </ClientOnly>
  );
}
