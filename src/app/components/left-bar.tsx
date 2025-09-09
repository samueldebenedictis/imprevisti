"use client";

import Link from "next/link";
import type { GameJSON } from "@/model/game";
import type { Player } from "@/model/player";
import {
  LABEL_DELETE_GAME_BUTTON,
  LABEL_RESTORE_GAME_BUTTON,
  LABEL_SAVE_GAME_BUTTON,
  LEFT_BAR_CURRENT_TURN,
  LEFT_BAR_GAME_SAVED,
  LEFT_BAR_GAME_STATUS,
  LEFT_BAR_PLAY_TURN,
  LEFT_BAR_PLAYERS_POSITION,
  LEFT_BAR_WINNER,
} from "../texts";
import { saveGame } from "../utils/game-storage";
import { URL_RESTORE_GAME } from "../vars";
import DiceRollDisplay from "./dice-roll-display";
import Button from "./ui/button";

type LeftBarProps = {
  currentPlayer: Player;
  playersPositions: Array<{ name: string; position: number }>;
  gameEnded: boolean;
  winnerName: string | undefined;
  onPlayTurnClick: () => void;
  onDeleteGame: () => void;
  gameInstance: GameJSON;
  // Dice roll component props
  showDiceRoll?: boolean;
  diceRollProps?: {
    onRollDice: () => void;
    isRolling: boolean;
    diceResult?: number | null;
    onContinue?: () => void;
    showResult?: boolean;
    currentPlayerName?: string;
  };
};

export default function LeftBar({
  currentPlayer,
  playersPositions,
  gameEnded,
  winnerName,
  onPlayTurnClick,
  onDeleteGame,
  gameInstance,
  showDiceRoll = false,
  diceRollProps,
}: LeftBarProps) {
  const handleSaveGame = () => {
    saveGame(gameInstance);
    alert(LEFT_BAR_GAME_SAVED);
  };
  return (
    <div
      className={`ui-border-dark mr-8 flex h-full max-w-xl flex-col items-center justify-between bg-gray-100 p-8`}
    >
      <div className="ui-text-dark ui-text-title mb-4">
        <p>{LEFT_BAR_GAME_STATUS}</p>
      </div>

      {/* Dice Roll Display */}
      {showDiceRoll && diceRollProps && (
        <div className="mb-4 w-full">
          <DiceRollDisplay
            {...diceRollProps}
            mustSkipTurn={currentPlayer.getTurnsToSkip() > 0}
          />
        </div>
      )}

      <div className="mr-4 mb-4 w-full">
        {!gameEnded && !showDiceRoll && (
          <Button
            onClick={onPlayTurnClick}
            disabled={gameEnded}
            color="blue"
            className="w-full"
          >
            {LEFT_BAR_PLAY_TURN}
          </Button>
        )}
        {gameEnded && winnerName && (
          <div className="ui-text-dark ui-text-subtitle mb-4 ml-4 text-green-600">
            {LEFT_BAR_WINNER(winnerName)}
          </div>
        )}
      </div>
      <div className="ui-text-dark ui-text-normal mb-4 w-full px-2">
        <p>
          {LEFT_BAR_CURRENT_TURN}{" "}
          <span className="text-blue-500">{currentPlayer.getName()}</span>
        </p>
        <div className="ui-text-subtitle mt-2">
          {LEFT_BAR_PLAYERS_POSITION}
          <ul className="ui-text-normal">
            {playersPositions.map((p) => (
              <li key={p.name}>
                <span className="text-blue-500">{p.name}</span>: {p.position}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mr-4 mb-4 w-full">
        <Button onClick={onDeleteGame} color="red" className="w-full">
          {LABEL_DELETE_GAME_BUTTON}
        </Button>
      </div>
      <div className="mr-4 mb-4 w-full">
        <Button onClick={handleSaveGame} color="green" className="w-full">
          {LABEL_SAVE_GAME_BUTTON}
        </Button>
      </div>
      <div className="mr-4 mb-4 w-full">
        <Button color="black" className="w-full">
          <Link href={URL_RESTORE_GAME}>{LABEL_RESTORE_GAME_BUTTON}</Link>
        </Button>
      </div>
    </div>
  );
}
