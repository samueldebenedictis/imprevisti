"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { GameJSON } from "@/model/game";
import Button from "./components/ui/button";
import Input from "./components/ui/input";
import {
  LABEL_GAME_CONFIGURATION,
  LABEL_MIME,
  LABEL_MOVE,
  LABEL_PLAYER_NAME,
  LABEL_PLAYERS_NUMBER,
  LABEL_QUIZ,
  LABEL_SPECIAL_PERCENTAGE,
  LABEL_SPECIAL_SQUARES,
  LABEL_SQUARES_NUMBER,
  LABEL_SUBMIT,
} from "./texts";
import { generateSquares } from "./utils/generate-squares";
import {
  MAX_PLAYERS,
  MIN_PLAYERS,
  STORAGE_STATE_KEY_GAME_CONFIG,
} from "./vars";

function Label(props: { children: string; htmlFor: string }) {
  return (
    <label htmlFor={props.htmlFor} className="ui-text-dark ui-text-subtitle">
      {props.children}
    </label>
  );
}

function LabelCheckbox(props: { children: string; htmlFor: string }) {
  return (
    <label htmlFor={props.htmlFor} className="ui-text-dark ui-text-normal">
      {props.children}
    </label>
  );
}

export default function Home() {
  const router = useRouter();
  const [numPlayers, setNumPlayers] = useState(2);
  const [playerNames, setPlayerNames] = useState<string[]>([""]);
  const [numSquares, setNumSquares] = useState(20);
  const [squareTypes, setSquareTypes] = useState({
    mime: false,
    quiz: false,
    move: false,
  });
  const [specialPercentage, setSpecialPercentage] = useState(40);

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

    const squareJSON = generateSquares(
      numSquares,
      squareTypes,
      specialPercentage / 100,
    );

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
    <div className="my-8 flex flex-col items-center justify-center p-2">
      <h1 className="ui-text-dark ui-text-title m-2">
        {LABEL_GAME_CONFIGURATION}
      </h1>
      <form onSubmit={handleSubmit} className="m-2 w-full max-w-md bg-white">
        <div className="mb-4">
          <Label htmlFor="numPlayers">{LABEL_PLAYERS_NUMBER}</Label>
          <Input
            type="number"
            id="numPlayers"
            name="numPlayers"
            min={`${MIN_PLAYERS}`}
            max={`${MAX_PLAYERS}`}
            value={numPlayers}
            onChange={handleNumPlayersChange}
            required
          />
        </div>

        {Array.from({ length: numPlayers }).map((item, index) => (
          <div key={`player-name-${item || index}`} className="mb-4">
            <Label htmlFor={`playerName${index}`}>
              {LABEL_PLAYER_NAME(index + 1)}
            </Label>
            <Input
              type="text"
              id={`playerName${index}`}
              name={`playerName${index}`}
              value={playerNames[index] || ""}
              onChange={(e) => handlePlayerNameChange(index, e.target.value)}
              required
            />
          </div>
        ))}

        <div className="mb-4">
          <Label htmlFor="numSquares">{LABEL_SQUARES_NUMBER}</Label>
          <Input
            type="number"
            id="numSquares"
            name="numSquares"
            min="10"
            value={numSquares}
            onChange={(e) => setNumSquares(parseInt(e.target.value))}
            required
          />
        </div>

        <div className="mb-4">
          <Label htmlFor="squareTypes">{LABEL_SPECIAL_SQUARES}</Label>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="mime"
              name="mime"
              checked={squareTypes.mime}
              onChange={handleSquareTypeChange}
              className="ui-custom-checkbox mr-2"
            />
            <LabelCheckbox htmlFor="mime">{LABEL_MIME}</LabelCheckbox>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="quiz"
              name="quiz"
              checked={squareTypes.quiz}
              onChange={handleSquareTypeChange}
              className="ui-custom-checkbox mr-2"
            />
            <LabelCheckbox htmlFor="quiz">{LABEL_QUIZ}</LabelCheckbox>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="move"
              name="move"
              checked={squareTypes.move}
              onChange={handleSquareTypeChange}
              className="ui-custom-checkbox mr-2"
            />
            <LabelCheckbox htmlFor="move">{LABEL_MOVE}</LabelCheckbox>
          </div>
        </div>

        <div className="mb-6">
          <Label htmlFor="specialPercentage">
            {LABEL_SPECIAL_PERCENTAGE(specialPercentage)}
          </Label>
          <input
            type="range"
            id="specialPercentage"
            name="specialPercentage"
            min="0"
            max="100"
            value={specialPercentage}
            onChange={(e) => setSpecialPercentage(parseInt(e.target.value))}
            className="w-full"
          />
        </div>

        <Button color="blue" type="submit" className="mx-auto">
          {LABEL_SUBMIT}
        </Button>
      </form>
    </div>
  );
}
