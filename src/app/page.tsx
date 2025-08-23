"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { GameJSON } from "@/model/game";
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
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold mb-8">Game Configuration</h1>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white p-8 rounded-lg shadow-md"
      >
        <div className="mb-4">
          <label
            htmlFor="numPlayers"
            className="block text-gray-700 text-sm font-bold mb-2"
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
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>

        {Array.from({ length: numPlayers }).map((item, index) => (
          <div key={`player-name-${item || index}`} className="mb-4">
            <label
              htmlFor={`playerName${index}`}
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Player {index + 1} Name:
            </label>
            <input
              type="text"
              id={`playerName${index}`}
              name={`playerName${index}`}
              value={playerNames[index] || ""}
              onChange={(e) => handlePlayerNameChange(index, e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
        ))}

        <div className="mb-4">
          <label
            htmlFor="numSquares"
            className="block text-gray-700 text-sm font-bold mb-2"
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
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>

        <div className="mb-6">
          <span className="block text-gray-700 text-sm font-bold mb-2">
            Square Types:
          </span>
          <div className="flex items-center mb-2">
            <input
              type="checkbox"
              id="mime"
              name="mime"
              checked={squareTypes.mime}
              onChange={handleSquareTypeChange}
              className="mr-2 leading-tight"
            />
            <label htmlFor="mime" className="text-sm text-gray-700">
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
            <label htmlFor="quiz" className="text-sm text-gray-700">
              Quiz
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Start Game
        </button>
      </form>
    </div>
  );
}
