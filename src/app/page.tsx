"use client";

import { useRouter } from "next/navigation";
import { useConfigStore } from "../store/config-store";
import { MAX_PLAYERS, MAX_SQUARES, MIN_PLAYERS, MIN_SQUARES } from "../vars";
import Button from "./components/ui/button";
import Input from "./components/ui/input";
import { Label, LabelCheckbox } from "./components/ui/label";
import {
  LABEL_BACKWRITE,
  LABEL_GAME_CONFIGURATION,
  LABEL_MIME,
  LABEL_MOVE,
  LABEL_MUSIC_EMOTION,
  LABEL_PHYSICAL_TEST,
  LABEL_PLAYER_NAME,
  LABEL_PLAYERS_NUMBER,
  LABEL_QUIZ,
  LABEL_SPECIAL_PERCENTAGE,
  LABEL_SPECIAL_SQUARES,
  LABEL_SQUARES_NUMBER,
  LABEL_SUBMIT,
  LABEL_WHAT_WOULD_YOU_DO,
} from "./texts";

export default function Home() {
  const router = useRouter();

  // Selettori store form
  const numPlayers = useConfigStore((state) => state.numPlayers);
  const playerNames = useConfigStore((state) => state.playerNames);
  const numSquares = useConfigStore((state) => state.numSquares);
  const squareTypes = useConfigStore((state) => state.squareTypes);
  const specialPercentage = useConfigStore((state) => state.specialPercentage);
  const actions = useConfigStore((state) => state.actions);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      actions.createGame();
      router.push("/game");
    } catch (error) {
      console.error("Failed to create game:", error);
      // TODO: aggiungere gestione errore
    }
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
            onChange={(e) => actions.setNumPlayers(parseInt(e.target.value))}
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
              onChange={(e) => actions.setPlayerName(index, e.target.value)}
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
            min={`${MIN_SQUARES}`}
            max={`${MAX_SQUARES}`}
            value={numSquares}
            onChange={(e) => actions.setNumSquares(parseInt(e.target.value))}
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
              onChange={(e) =>
                actions.setSquareType(
                  e.target.name as keyof typeof squareTypes,
                  e.target.checked,
                )
              }
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
              onChange={(e) =>
                actions.setSquareType(
                  e.target.name as keyof typeof squareTypes,
                  e.target.checked,
                )
              }
              className="ui-custom-checkbox mr-2"
            />
            <LabelCheckbox htmlFor="quiz">{LABEL_QUIZ}</LabelCheckbox>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="backwrite"
              name="backwrite"
              checked={squareTypes.backwrite}
              onChange={(e) =>
                actions.setSquareType(
                  e.target.name as keyof typeof squareTypes,
                  e.target.checked,
                )
              }
              className="ui-custom-checkbox mr-2"
            />
            <LabelCheckbox htmlFor="backwrite">{LABEL_BACKWRITE}</LabelCheckbox>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="move"
              name="move"
              checked={squareTypes.move}
              onChange={(e) =>
                actions.setSquareType(
                  e.target.name as keyof typeof squareTypes,
                  e.target.checked,
                )
              }
              className="ui-custom-checkbox mr-2"
            />
            <LabelCheckbox htmlFor="move">{LABEL_MOVE}</LabelCheckbox>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="music-emotion"
              name="music-emotion"
              checked={squareTypes["music-emotion"]}
              onChange={(e) =>
                actions.setSquareType(
                  e.target.name as keyof typeof squareTypes,
                  e.target.checked,
                )
              }
              className="ui-custom-checkbox mr-2"
            />
            <LabelCheckbox htmlFor="music-emotion">
              {LABEL_MUSIC_EMOTION}
            </LabelCheckbox>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="physical-test"
              name="physical-test"
              checked={squareTypes["physical-test"]}
              onChange={(e) =>
                actions.setSquareType(
                  e.target.name as keyof typeof squareTypes,
                  e.target.checked,
                )
              }
              className="ui-custom-checkbox mr-2"
            />
            <LabelCheckbox htmlFor="physical-test">
              {LABEL_PHYSICAL_TEST}
            </LabelCheckbox>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="what-would-you-do"
              name="what-would-you-do"
              checked={squareTypes["what-would-you-do"]}
              onChange={(e) =>
                actions.setSquareType(
                  e.target.name as keyof typeof squareTypes,
                  e.target.checked,
                )
              }
              className="ui-custom-checkbox mr-2"
            />
            <LabelCheckbox htmlFor="what-would-you-do">
              {LABEL_WHAT_WOULD_YOU_DO}
            </LabelCheckbox>
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
            onChange={(e) =>
              actions.setSpecialPercentage(parseInt(e.target.value))
            }
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
