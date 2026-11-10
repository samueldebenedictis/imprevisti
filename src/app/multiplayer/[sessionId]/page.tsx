"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { LEFT_BAR_CURRENT_TURN, LEFT_BAR_PLAYERS_POSITION } from "@/app/texts";
import { useSessionPolling } from "@/lib/use-session-polling";
import { Game } from "@/model/game";
import { MoveSquare } from "@/model/square";
import { useConfigStore } from "@/store/config-store";
import { ACTION_TYPE_LABELS } from "@/store/game-store";
import type { PublicSessionState } from "@/types/session";
import BoardComponent from "../../components/board";
import GameOverOverlay from "../../components/game-over-overlay";
import HostActionOverlay from "../../components/host-action-overlay";
import HostBattleOverlay from "../../components/host-battle-overlay";
import { IdleOverlay } from "../../components/idle-overlay";
import PawnsLayer from "../../components/pawns-layer";
import { QrCode } from "../../components/qr-code";
import SquareC from "../../components/square";
import Button from "../../components/ui/button";
import { soundManager } from "../../utils/sound-manager";

export default function MultiplayerSessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [hostToken, setHostToken] = useState<string | null>(null);
  const [joinUrl, setJoinUrl] = useState<string>("");
  const [startError, setStartError] = useState<string>("");
  const [isResolving, setIsResolving] = useState(false);

  const { session, idleState, resume } = useSessionPolling(sessionId);

  // Il Game autoritativo vive sul server: qui serve solo a disegnare il
  // tabellone. Niente game-store, che è persistito e sovrascriverebbe la
  // partita a schermo singolo salvata nel browser.
  const game = useMemo(
    () =>
      session?.started && session.gameState
        ? Game.fromJSON(session.gameState)
        : null,
    [session?.started, session?.gameState],
  );
  const currentPlayer = game ? game.getPlayers()[game.getTurn()] : null;

  const config = useConfigStore((state) => state);

  useEffect(() => {
    const token = localStorage.getItem("hostToken");
    setHostToken(token);
    setJoinUrl(`${window.location.origin}/join/${sessionId}`);
  }, [sessionId]);

  // Annuncio vocale dei lanci: lo schermo host è quello condiviso, quindi
  // la voce va qui e non sui dispositivi dei giocatori.
  // Il primo valore osservato viene solo memorizzato, per non riannunciare
  // un lancio già avvenuto quando la pagina viene ricaricata.
  const lastAnnouncedRollRef = useRef<number | null | undefined>(undefined);
  useEffect(() => {
    if (!session) return;
    const move = session.lastMoveInfo;
    const rolledAt = move?.rolledAt ?? null;
    if (lastAnnouncedRollRef.current === undefined) {
      lastAnnouncedRollRef.current = rolledAt;
      return;
    }
    if (!move || rolledAt === lastAnnouncedRollRef.current) return;
    lastAnnouncedRollRef.current = rolledAt;

    // La vittoria è annunciata dall'effetto dedicato qui sotto
    if (session.gameOver) return;

    const playerName =
      session.players.find((p) => p.id === move.actorPlayerId)?.name ?? "";
    if (move.diceResult === 0) {
      soundManager.speakTurnSkip(playerName);
    } else {
      const actionType = session.pendingAction?.type;
      soundManager.speakDiceResult(
        playerName,
        move.diceResult,
        move.squareNumber,
        actionType ? ACTION_TYPE_LABELS[actionType] : null,
      );
    }
  }, [session]);

  // Suono e annuncio della vittoria, sia dopo un lancio sia dopo l'esito di una
  // sfida. Come per i lanci, una partita già finita al caricamento non viene riannunciata.
  const wasGameOverRef = useRef<boolean | undefined>(undefined);
  useEffect(() => {
    if (!session) return;
    const isGameOver = Boolean(session.gameOver);
    if (wasGameOverRef.current === undefined) {
      wasGameOverRef.current = isGameOver;
      return;
    }
    if (isGameOver && !wasGameOverRef.current && session.gameOver) {
      soundManager.playVictory();
      soundManager.speakVictory(session.gameOver.winnerName);
    }
    wasGameOverRef.current = isGameOver;
  }, [session]);

  const startGame = async () => {
    if (!sessionId || !hostToken) return;
    setStartError("");
    const res = await fetch(`/api/sessions/${sessionId}/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        hostToken,
        boardConfig: {
          numSquares: config.numSquares,
          squareTypes: config.squareTypes,
          specialPercentage: config.specialPercentage,
          customSquares: config.customSquares,
          battlesEnabled: config.battlesEnabled,
        },
      }),
    });
    if (!res.ok) {
      const data = await res.json();
      setStartError(data.error ?? "Errore nell'avvio");
    }
  };

  const resolveActionAsHost = async (success: boolean) => {
    if (!sessionId || !hostToken || isResolving) return;
    setIsResolving(true);
    try {
      await fetch(`/api/sessions/${sessionId}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hostToken, success }),
      });
    } finally {
      setIsResolving(false);
    }
  };

  const resolveWithWinner = async (winnerId: string) => {
    if (!sessionId || !hostToken || isResolving) return;
    setIsResolving(true);
    try {
      await fetch(`/api/sessions/${sessionId}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hostToken, success: true, winnerId }),
      });
    } finally {
      setIsResolving(false);
    }
  };

  const resolveBattleAsHost = async (winnerId: string) => {
    if (!sessionId || !hostToken || isResolving) return;
    setIsResolving(true);
    try {
      await fetch(`/api/sessions/${sessionId}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hostToken, success: true, winnerId }),
      });
    } finally {
      setIsResolving(false);
    }
  };

  const playersPositions = useMemo(
    () =>
      game
        ? game.getPlayers().map((player) => ({
            id: String(player.getId()),
            name: player.getName(),
            position: game.getPlayerPosition(player),
          }))
        : [],
    [game],
  );

  const size = game ? game.getBoard().getSquares().length : 0;
  const squaresC = useMemo(
    () =>
      game
        ? game
            .getBoard()
            .getSquares()
            .map((el, index) =>
              SquareC({
                number: el.getNumber(),
                squareType:
                  index === 0
                    ? "first"
                    : index === size - 1
                      ? "last"
                      : el.getType(),
                moveValue: el instanceof MoveSquare ? el.moveValue : undefined,
              }),
            )
        : [],
    [game, size],
  );

  // LOBBY
  if (!session?.started) {
    return (
      <>
        <LobbyView
          sessionId={sessionId}
          joinUrl={joinUrl}
          session={session}
          startError={startError}
          onStart={startGame}
        />
        <IdleOverlay idleState={idleState} onResume={resume} />
      </>
    );
  }

  // BOARD VIEW
  const currentTurnPlayer = session.players.find(
    (p) => p.id === session.currentPlayerId,
  );
  const pendingAction = session.pendingAction;

  return (
    <>
      <div className="mt-6 flex items-start justify-center gap-8 p-4">
        {/* Sidebar host */}
        <div className="sticky top-6 flex w-48 flex-shrink-0 flex-col gap-4 self-start">
          <div className="ui-border-dark flex flex-col gap-1 bg-gray-100 p-4">
            <p className="ui-text-subtitle">
              {LEFT_BAR_CURRENT_TURN}{" "}
              <span className="text-blue-500">
                {currentTurnPlayer?.name ?? "..."}
              </span>
            </p>
            {session.diceResult !== null && (
              <p className="ui-text-normal">Dado: {session.diceResult}</p>
            )}
            <div className="ui-text-subtitle mt-2">
              {LEFT_BAR_PLAYERS_POSITION}
              <ul className="ui-text-normal">
                {playersPositions.map((p) => (
                  <li key={p.id}>
                    <span className="text-blue-500">{p.name}</span>:{" "}
                    {p.position}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p className="ui-text-normal text-center">
            Sessione: <strong>{sessionId}</strong>
          </p>
        </div>

        {/* Board */}
        <div className="relative flex flex-shrink-0 flex-col items-center justify-center">
          {BoardComponent({ squares: squaresC, cols: 5 })}
          <PawnsLayer
            players={playersPositions}
            currentPlayerId={
              currentPlayer ? String(currentPlayer.getId()) : null
            }
            cols={5}
            totalSquares={size}
          />
        </div>

        {/* Game over overlay */}
        {session.gameOver && (
          <GameOverOverlay winnerName={session.gameOver.winnerName} />
        )}

        {/* Battle overlay */}
        {pendingAction?.type === "battle" && (
          <HostBattleOverlay
            players={[pendingAction.actorPlayerId, pendingAction.targetPlayerId]
              .filter((pid): pid is string => !!pid)
              .map((pid) => ({
                id: pid,
                name: session.players.find((p) => p.id === pid)?.name ?? "",
              }))}
            onResolve={resolveBattleAsHost}
            isResolving={isResolving}
          />
        )}

        {/* Overlay unificato per tutte le azioni speciali non-battaglia */}
        {pendingAction && pendingAction.type !== "battle" && (
          <HostActionOverlay
            pendingAction={pendingAction}
            players={session.players}
            onResolve={(success) => void resolveActionAsHost(success)}
            onResolveWithWinner={(winnerId) => void resolveWithWinner(winnerId)}
            isResolving={isResolving}
          />
        )}
      </div>
      <IdleOverlay idleState={idleState} onResume={resume} />
    </>
  );
}

function LobbyView({
  sessionId,
  joinUrl,
  session,
  startError,
  onStart,
}: {
  sessionId: string;
  joinUrl: string;
  session: PublicSessionState | null;
  startError: string;
  onStart: () => void;
}) {
  const playerCount = session?.players.length ?? 0;

  return (
    <div className="ui-text-dark my-8 flex flex-col items-center justify-center gap-8 p-8">
      <h1 className="ui-text-title">La Città degli Imprevisti</h1>
      <p className="ui-text-normal">Multi-dispositivo</p>

      {joinUrl ? (
        <QrCode url={joinUrl} size={280} />
      ) : (
        <div className="ui-border-dark h-[280px] w-[280px] animate-pulse bg-gray-100" />
      )}

      {sessionId && (
        <p className="ui-text-normal">
          Scansiona per unirti · Sessione: <strong>{sessionId}</strong>
        </p>
      )}

      <div className="flex min-h-16 w-full max-w-xs flex-col gap-2">
        {playerCount === 0 && (
          <p className="ui-text-normal text-center">
            In attesa dei giocatori...
          </p>
        )}
        {(session?.players ?? []).map((p) => (
          <div
            key={p.id}
            className="ui-border-dark flex items-center gap-2 bg-gray-100 px-4 py-2"
          >
            <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
            <span className="ui-text-normal">{p.name}</span>
          </div>
        ))}
      </div>

      {startError && (
        <p className="ui-text-normal text-red-600">{startError}</p>
      )}

      <Button
        color="green"
        onClick={onStart}
        disabled={playerCount < 2}
        className="mx-0 px-10"
      >
        Inizia ({playerCount} giocatori)
      </Button>
    </div>
  );
}
