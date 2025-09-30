"use client";

import { useRouter } from "next/navigation";
import { useConfigStore } from "../store/config-store";
import { MAX_PLAYERS, MAX_SQUARES, MIN_PLAYERS, MIN_SQUARES } from "../vars";
import Button from "./components/ui/button";
import Input from "./components/ui/input";
import { Label, LabelCheckbox } from "./components/ui/label";
import {
  LABEL_BACKWRITE,
  LABEL_DICTATION_DRAW,
  LABEL_FACE_EMOTION,
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

  const squareTypeOptions = [
    { key: "mime", label: LABEL_MIME },
    { key: "quiz", label: LABEL_QUIZ },
    { key: "backwrite", label: LABEL_BACKWRITE },
    { key: "face-emotion", label: LABEL_FACE_EMOTION },
    { key: "move", label: LABEL_MOVE },
    { key: "music-emotion", label: LABEL_MUSIC_EMOTION },
    { key: "physical-test", label: LABEL_PHYSICAL_TEST },
    { key: "what-would-you-do", label: LABEL_WHAT_WOULD_YOU_DO },
    { key: "dictation-draw", label: LABEL_DICTATION_DRAW },
  ];

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
    <div className="ui-text-dark my-8 flex flex-col items-center justify-center p-2">
      <h1 className=" ui-text-title m-2">{LABEL_GAME_CONFIGURATION}</h1>
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
              value={playerNames[index] ?? ""}
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
          {squareTypeOptions.map(({ key, label }) => (
            <div key={key} className="flex items-center">
              <input
                type="checkbox"
                id={key}
                name={key}
                checked={squareTypes[key as keyof typeof squareTypes]}
                onChange={(e) =>
                  actions.setSquareType(
                    key as keyof typeof squareTypes,
                    e.target.checked,
                  )
                }
                className="ui-custom-checkbox mr-2"
              />
              <LabelCheckbox htmlFor={key}>{label}</LabelCheckbox>
            </div>
          ))}
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
