"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { GameJSON } from "@/model/game";
import Input from "./components/input";
import { STORAGE_STATE_KEY_GAME_CONFIG } from "./vars";

export default function Home() {
  const router = useRouter();
  const [numPlayers, setNumPlayers] = useState(2);
  const [playerNames, setPlayerNames] = useState<string[]>([""]);
  const [numSquares, setNumSquares] = useState(20);
  const [squareTypes, setSquareTypes] = useState({
    mime: false,
    quiz: false,
  });

  const handleNumPlayersChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value > 0) {
      setNumPlayers(value);
      setPlayerNames(Array(value).fill(""));
    }
  };

  const handlePlayerNameChange = (index: number, name: string) => {
    const newPlayerNames = [...playerNames];
    newPlayerNames[index] = name;
    setPlayerNames(newPlayerNames);
  };

  const handleSquareTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSquareTypes({
      ...squareTypes,
      [e.target.name]: e.target.checked,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const gameConfig = {
      numPlayers,
      playerNames,
      numSquares,
      squareTypes,
    };
    localStorage.setItem(
      STORAGE_STATE_KEY_GAME_CONFIG,
      JSON.stringify(gameConfig),
    );

    const playersJSON = playerNames.map((el, id) => ({
      id,
      name: el,
      turnsToSkip: 0,
    }));
    const squareJSON = Array.from(Array(numSquares).keys()).map((_e, i) => ({
      number: i,
      type: "normal",
    }));
    const gameInstance: GameJSON = {
      currentRound: 1,
      currentTurn: 0,
      players: playersJSON,
      winnerId: undefined,
      gameEnded: false,
      board: {
        playersPosition: playersJSON.map((el) => ({
          playerId: el.id,
          position: 0,
        })),
        squares: squareJSON,
      },
    };
    localStorage.setItem("gameInstance", JSON.stringify(gameInstance));

    router.push("/game");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <h1 className="mb-8 font-bold text-4xl">Game Configuration</h1>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-lg bg-white p-8 shadow-md"
      >
        <div className="mb-4">
          <label
            htmlFor="numPlayers"
            className="mb-1 block font-bold text-gray-700 text-sm"
          >
            Number of Players:
          </label>
          <input
            type="number"
            id="numPlayers"
            name="numPlayers"
            min="2"
            value={numPlayers}
            onChange={handleNumPlayersChange}
            className="w-full appearance-none rounded border px-3 py-2 text-gray-700 leading-tight shadow focus:shadow-outline focus:outline-none"
            required
          />
        </div>

        {Array.from({ length: numPlayers }).map((item, index) => (
          <div key={`player-name-${item || index}`} className="mb-4">
            <label
              htmlFor={`playerName${index}`}
              className="mb-1 block font-bold text-gray-700 text-sm"
            >
              Player {index + 1} Name:
            </label>
            <Input
              type="text"
              id={`playerName${index}`}
              name={`playerName${index}`}
              value={playerNames[index] || ""}
              onChange={(e) => handlePlayerNameChange(index, e.target.value)}
              className="w-full px-3 py-2 text-gray-800"
              required
            />
          </div>
        ))}

        <div className="mb-4">
          <label
            htmlFor="numSquares"
            className="mb-1 block font-bold text-gray-700 text-sm"
          >
            Number of Squares:
          </label>
          <input
            type="number"
            id="numSquares"
            name="numSquares"
            min="10"
            value={numSquares}
            onChange={(e) => setNumSquares(parseInt(e.target.value))}
            className="w-full appearance-none rounded border px-3 py-2 text-gray-700 leading-tight shadow focus:shadow-outline focus:outline-none"
            required
          />
        </div>

        <div className="mb-6">
          <span className="mb-1 block font-bold text-gray-700 text-sm">
            Square Types:
          </span>
          <div className="mb-1 flex items-center">
            <input
              type="checkbox"
              id="mime"
              name="mime"
              checked={squareTypes.mime}
              onChange={handleSquareTypeChange}
              className="mr-2 leading-tight"
            />
            <label htmlFor="mime" className="text-gray-700 text-sm">
              Mime
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="quiz"
              name="quiz"
              checked={squareTypes.quiz}
              onChange={handleSquareTypeChange}
              className="mr-2 leading-tight"
            />
            <label htmlFor="quiz" className="text-gray-700 text-sm">
              Quiz
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:shadow-outline focus:outline-none"
        >
          Start Game
        </button>
      </form>
    </div>
  );
}
