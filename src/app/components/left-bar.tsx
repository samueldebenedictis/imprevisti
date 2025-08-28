"use client";

import type { Player } from "@/model/player";
import Button from "./ui/button";

type LeftBarProps = {
  currentPlayer: Player;
  playersPositions: Array<{ name: string; position: number }>;
  gameEnded: boolean;
  winnerName: string | undefined;
  onPlayTurnClick: () => void;
  onDeleteGame: () => void;
};

export default function LeftBar({
  currentPlayer,
  playersPositions,
  gameEnded,
  winnerName,
  onPlayTurnClick,
  onDeleteGame,
}: LeftBarProps) {
  return (
    <div
      className={`ui-border-dark mr-8 flex h-full max-w-xl flex-col items-center justify-between p-8`}
    >
      <div className="ui-text-subtitle mb-4">
        <p>Stato del gioco</p>
      </div>
      <div className="mb-4 w-full">
        {!gameEnded && (
          <Button
            onClick={onPlayTurnClick}
            disabled={gameEnded}
            color="blue"
            className="w-full"
          >
            Gioca un turno
          </Button>
        )}
        {gameEnded && (
          <div className="ui-text-dark ui-text-subtitle mb-4 text-center text-green-600">
            Vincitore: {winnerName}!
          </div>
        )}
      </div>
      <div className="ui-text-normal mb-4">
        <p>Turno di: {currentPlayer.getName()}</p>
        <div className="mt-2">
          Posizioni dei giocatori:
          <ul>
            {playersPositions.map((p) => (
              <li key={p.name}>
                {p.name}: {p.position}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mb-4 w-full">
        <Button onClick={onDeleteGame} color="red" className="w-full">
          Elimina Partita
        </Button>
      </div>
    </div>
  );
}
