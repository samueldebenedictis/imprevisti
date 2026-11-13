"use client";

import { useEffect, useState } from "react";
import type { PawnStyle } from "@/model/pawn";
import { LABEL_OTHER_PLAYERS } from "../texts";
import { soundManager } from "../utils/sound-manager";
import Pawn from "./pawn";
import type { Color } from "./ui/color";

type PlayerPosition = {
  id: string;
  name: string;
  position: number;
  pawn: PawnStyle;
};

type PawnsLayerProps = {
  players: PlayerPosition[];
  currentPlayerId?: string | null;
  cols: number;
  totalSquares: number;
};

// Durata di un singolo balzo da una casella alla successiva.
const HOP_DURATION_MS = 260;

// Pedina riassuntiva "N giocatori": colore neutro, raccoglie pedine diverse
const GROUP_COLOR: Color = "black";

// Fino a tante pedine sulla stessa casella si vedono tutte; oltre, quella di
// chi è di turno più una pedina riassuntiva
const MAX_VISIBLE_PAWNS = 3;

function cellStyle(position: number, cols: number, rows: number) {
  const row = Math.floor(position / cols);
  const col = position % cols;
  return {
    width: `${100 / cols}%`,
    height: `${100 / rows}%`,
    transform: `translate(${col * 100}%, ${row * 100}%)`,
  };
}

// Anima le pedine facendole passare, un balzo alla volta, per ogni casella
// intermedia tra la posizione mostrata e quella reale, invece di saltare
// direttamente al traguardo.
function useSteppedPositions(players: PlayerPosition[]) {
  const [displayed, setDisplayed] = useState<Map<string, number>>(() => {
    const initial = new Map<string, number>();
    for (const player of players) {
      initial.set(player.id, player.position);
    }
    return initial;
  });

  // Nuovi giocatori (es. entrati in corsa) partono direttamente dalla loro
  // posizione attuale, senza balzi da inventare.
  useEffect(() => {
    setDisplayed((prev) => {
      let changed = false;
      const next = new Map(prev);
      for (const player of players) {
        if (!next.has(player.id)) {
          next.set(player.id, player.position);
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [players]);

  useEffect(() => {
    const pending = players.some(
      (player) => displayed.get(player.id) !== player.position,
    );
    if (!pending) return;

    const timer = setTimeout(() => {
      soundManager.playPawnMove();
      setDisplayed((prev) => {
        const next = new Map(prev);
        for (const player of players) {
          const current = next.get(player.id) ?? player.position;
          if (current !== player.position) {
            next.set(
              player.id,
              current < player.position ? current + 1 : current - 1,
            );
          }
        }
        return next;
      });
    }, HOP_DURATION_MS);

    return () => clearTimeout(timer);
  }, [players, displayed]);

  return displayed;
}

export default function PawnsLayer(props: PawnsLayerProps) {
  const rows = Math.max(1, Math.ceil(props.totalSquares / props.cols));
  const displayedPositions = useSteppedPositions(props.players);

  const bySquare = new Map<number, PlayerPosition[]>();
  for (const player of props.players) {
    const position = displayedPositions.get(player.id) ?? player.position;
    const group = bySquare.get(position) ?? [];
    group.push(player);
    bySquare.set(position, group);
  }

  return (
    <div className="pointer-events-none absolute inset-0">
      {Array.from(bySquare.entries()).map(([position, group]) => {
        const currentPlayer = group.find((p) => p.id === props.currentPlayerId);
        const otherPlayers = group.filter(
          (p) => p.id !== props.currentPlayerId,
        );
        // Chiave stabile sull'id del giocatore di turno: il nodo persiste
        // mentre è il suo turno, così il transform anima davvero il
        // movimento, balzo dopo balzo. Altrimenti si aggancia alla casella
        // (nessuna animazione richiesta per pedine ferme).
        const key = currentPlayer
          ? `player-${currentPlayer.id}`
          : `square-${position}`;
        // Mentre la pedina sta balzando verso la casella di arrivo, niente
        // animate-bounce (riservato all'attesa prima del lancio del dado).
        const isHopping = currentPlayer
          ? currentPlayer.position !== position
          : false;

        return (
          <div
            key={key}
            className={`absolute top-0 left-0 ${currentPlayer ? "transition-transform" : ""}`}
            style={{
              ...cellStyle(position, props.cols, rows),
              ...(currentPlayer
                ? {
                    transitionDuration: `${HOP_DURATION_MS}ms`,
                    transitionTimingFunction: "cubic-bezier(0.34,1.56,0.64,1)",
                  }
                : {}),
            }}
          >
            <div className="absolute inset-2 flex flex-col justify-end px-1">
              {currentPlayer && (
                <div key={`hop-${position}`} className="pawn-hop">
                  <Pawn
                    name={currentPlayer.name}
                    color={currentPlayer.pawn.color}
                    shape={currentPlayer.pawn.shape}
                    isCurrentPlayerTurn={!isHopping}
                  />
                </div>
              )}
              {group.length <= MAX_VISIBLE_PAWNS
                ? otherPlayers.map((player) => (
                    <Pawn
                      key={`pawn-${player.id}`}
                      name={player.name}
                      color={player.pawn.color}
                      shape={player.pawn.shape}
                      isCurrentPlayerTurn={false}
                    />
                  ))
                : otherPlayers.length > 0 && (
                    <Pawn
                      name={`${otherPlayers.length.toString()} ${LABEL_OTHER_PLAYERS}`}
                      color={GROUP_COLOR}
                      isCurrentPlayerTurn={false}
                    />
                  )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
