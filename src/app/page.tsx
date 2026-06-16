"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useConfigStore } from "../store/config-store";
import {
  MAX_PLAYERS,
  MAX_SQUARES,
  MIN_PLAYERS,
  MIN_SQUARES,
  URL_ADVANCED_MODE,
  URL_MULTIPLAYER,
} from "../vars";
import Button from "./components/ui/button";
import { colorToCssButton } from "./components/ui/color";
import Input from "./components/ui/input";
import { Label, LabelCheckbox } from "./components/ui/label";
import {
  LABEL_ADVANCED_MODE,
  LABEL_ADVANCED_MODE_ACTIVE,
  LABEL_ADVANCED_MODE_REMOVE,
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

type Mode = "single" | "multi";

function ModeSelection({ onSelect }: { onSelect: (mode: Mode) => void }) {
  return (
    <div className="ui-text-dark my-8 flex flex-col items-center justify-center gap-8 p-8">
      <h1 className="ui-text-title text-center">La Città degli Imprevisti</h1>
      <p className="ui-text-normal">Come vuoi giocare?</p>
      <div className="flex w-full max-w-md flex-col gap-4 sm:flex-row">
        <button
          type="button"
          className={`ui-text-subtitle ui-text-light ui-border-dark ui-animation-scale flex flex-1 flex-col items-center gap-2 py-8 shadow-xl ${colorToCssButton("blue")}`}
          onClick={() => onSelect("single")}
        >
          Schermo singolo
          <span className="ui-text-normal opacity-80">
            Tutti attorno allo stesso schermo
          </span>
        </button>
        <button
          type="button"
          className={`ui-text-subtitle ui-text-light ui-border-dark ui-animation-scale flex flex-1 flex-col items-center gap-2 py-8 shadow-xl ${colorToCssButton("green")}`}
          onClick={() => onSelect("multi")}
        >
          Multi-dispositivo
          <span className="ui-text-normal opacity-80">
            Ogni giocatore usa il proprio telefono
          </span>
        </button>
      </div>
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode | null>(() => {
    if (typeof window === "undefined") return null;
    return (sessionStorage.getItem("gameMode") as Mode) ?? null;
  });

  const handleModeSelect = (m: Mode) => {
    sessionStorage.setItem("gameMode", m);
    setMode(m);
  };

  // Selettori store form
  const numPlayers = useConfigStore((state) => state.numPlayers);
  const playerNames = useConfigStore((state) => state.playerNames);
  const numSquares = useConfigStore((state) => state.numSquares);
  const squareTypes = useConfigStore((state) => state.squareTypes);
  const specialPercentage = useConfigStore((state) => state.specialPercentage);
  const customSquares = useConfigStore((state) => state.customSquares);
  const actions = useConfigStore((state) => state.actions);

  const hasCustomSquares =
    customSquares !== null && customSquares.length === numSquares;

  const squareTypeOptions = [
    { key: "move", label: LABEL_MOVE },
    { key: "mime", label: LABEL_MIME },
    { key: "quiz", label: LABEL_QUIZ },
    { key: "backwrite", label: LABEL_BACKWRITE },
    { key: "face-emotion", label: LABEL_FACE_EMOTION },
    { key: "music-emotion", label: LABEL_MUSIC_EMOTION },
    { key: "physical-test", label: LABEL_PHYSICAL_TEST },
    { key: "what-would-you-do", label: LABEL_WHAT_WOULD_YOU_DO },
    { key: "dictation-draw", label: LABEL_DICTATION_DRAW },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (mode === "multi") {
        // In modalità multi: non creare gioco localmente, naviga al multiplayer
        // Il gioco viene creato server-side da /multiplayer via /api/sessions/[id]/start
        router.push(URL_MULTIPLAYER);
      } else {
        actions.createGame();
        router.push("/game");
      }
    } catch (error) {
      console.error("Failed to create game:", error);
    }
  };

  const mobileWall = (
    <div className="ui-text-dark flex min-h-[80vh] flex-col items-center justify-center gap-6 p-8 text-center md:hidden">
      <h1 className="ui-text-title">La Città degli Imprevisti</h1>
      <p className="ui-text-normal">
        Per giocare, scansiona il QR code
        <br />
        sul tabellone di gioco.
      </p>
    </div>
  );

  if (!mode) {
    return (
      <>
        {mobileWall}
        <div className="hidden md:block">
          <ModeSelection onSelect={handleModeSelect} />
        </div>
      </>
    );
  }

  return (
    <>
      {mobileWall}
      <div className="hidden md:block">
        <div className="ui-text-dark my-8 flex flex-col items-center justify-center p-2">
          <div className="mb-2 flex flex-col items-center gap-1">
            <span className="ui-text-normal">
              {mode === "multi" ? "Multi-dispositivo" : "Schermo singolo"}
            </span>
            <Button
              color="red"
              onClick={() => {
                sessionStorage.removeItem("gameMode");
                setMode(null);
              }}
              className="mx-0"
            >
              Cambia modalità
            </Button>
          </div>
          <h1 className="ui-text-title m-2">{LABEL_GAME_CONFIGURATION}</h1>
          {mode === "multi" && (
            <p className="ui-text-normal mb-4 max-w-md text-center">
              Configura il tabellone. I giocatori si uniranno scansionando il QR
              code.
            </p>
          )}
          <form
            onSubmit={handleSubmit}
            className="m-2 w-full max-w-md bg-white"
          >
            {mode === "single" && (
              <>
                <div className="mb-4">
                  <Label htmlFor="numPlayers">{LABEL_PLAYERS_NUMBER}</Label>
                  <Input
                    type="number"
                    id="numPlayers"
                    name="numPlayers"
                    min={`${MIN_PLAYERS}`}
                    max={`${MAX_PLAYERS}`}
                    value={numPlayers}
                    onChange={(e) =>
                      actions.setNumPlayers(parseInt(e.target.value))
                    }
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
                      onChange={(e) =>
                        actions.setPlayerName(index, e.target.value)
                      }
                      required
                    />
                  </div>
                ))}
              </>
            )}

            <div className="mb-4">
              <Label htmlFor="numSquares">{LABEL_SQUARES_NUMBER}</Label>
              <Input
                type="number"
                id="numSquares"
                name="numSquares"
                min={`${MIN_SQUARES}`}
                max={`${MAX_SQUARES}`}
                value={numSquares}
                onChange={(e) =>
                  actions.setNumSquares(parseInt(e.target.value))
                }
                required
              />
            </div>

            {!hasCustomSquares && (
              <>
                <div className="mb-4">
                  <Label htmlFor="squareTypes">{LABEL_SPECIAL_SQUARES}</Label>
                  <div className="grid grid-cols-2 gap-x-4">
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
                </div>

                <div className="mb-4">
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
                    className="mx-0 w-full"
                  />
                </div>
              </>
            )}

            {/* Modalità avanzata */}
            <div className="mb-2 border-gray-200 border-b pb-2">
              {hasCustomSquares ? (
                <div className="flex flex-col items-center gap-2">
                  <span className="ui-text-normal font-bold text-green-700">
                    ✓ {LABEL_ADVANCED_MODE_ACTIVE}
                  </span>
                  <div className="flex w-full flex-col">
                    <Button
                      color="blue"
                      onClick={() => router.push(URL_ADVANCED_MODE)}
                      className="mx-0 w-full"
                    >
                      {LABEL_ADVANCED_MODE}
                    </Button>
                    <Button
                      color="red"
                      onClick={() => actions.clearCustomSquares()}
                      className="mx-0 w-full"
                    >
                      {LABEL_ADVANCED_MODE_REMOVE}
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  color="blue"
                  onClick={() => router.push(URL_ADVANCED_MODE)}
                  className="mx-0 w-full"
                >
                  {LABEL_ADVANCED_MODE}
                </Button>
              )}
            </div>
            <div className="mt-4">
              <Button color="green" type="submit" className="mx-0 w-full">
                {LABEL_SUBMIT}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
