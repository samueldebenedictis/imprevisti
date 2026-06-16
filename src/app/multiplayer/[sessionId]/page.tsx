"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  LABEL_BACKWRITE,
  LABEL_BATTLE,
  LABEL_DICTATION_DRAW,
  LABEL_FACE_EMOTION,
  LABEL_MIME,
  LABEL_MUSIC_EMOTION,
  LABEL_PHYSICAL_TEST,
  LABEL_QUIZ,
  LABEL_WHAT_WOULD_YOU_DO,
  LEFT_BAR_CURRENT_TURN,
  LEFT_BAR_PLAYERS_POSITION,
} from "@/app/texts";
import { getCardDisplay } from "@/lib/card-utils";
import { useSessionPolling } from "@/lib/use-session-polling";
import { Game } from "@/model/game";
import { MoveSquare } from "@/model/square";
import { useConfigStore } from "@/store/config-store";
import { useCurrentPlayer, useGameStore } from "@/store/game-store";
import type { PublicSessionState } from "@/types/session";
import { URL_HOME } from "@/vars";
import BoardComponent from "../../components/board";
import { IdleOverlay } from "../../components/idle-overlay";
import { QrCode } from "../../components/qr-code";
import SquareC from "../../components/square";
import Button from "../../components/ui/button";
import { imagePrefix } from "../../image-prefix";

const ACTION_LABELS: Record<string, string> = {
  quiz: LABEL_QUIZ,
  mime: LABEL_MIME,
  backwrite: LABEL_BACKWRITE,
  "face-emotion": LABEL_FACE_EMOTION,
  "music-emotion": LABEL_MUSIC_EMOTION,
  "physical-test": LABEL_PHYSICAL_TEST,
  "what-would-you-do": LABEL_WHAT_WOULD_YOU_DO,
  "dictation-draw": LABEL_DICTATION_DRAW,
  battle: LABEL_BATTLE,
};

// Azioni che richiedono selezione del vincitore dopo "Riuscito"
const MIME_LIKE = ["mime", "dictation-draw"];

export default function MultiplayerSessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [hostToken, setHostToken] = useState<string | null>(null);
  const [joinUrl, setJoinUrl] = useState<string>("");
  const [startError, setStartError] = useState<string>("");
  const [selectingWinner, setSelectingWinner] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isResolving, setIsResolving] = useState(false);

  const { session, idleState, resume } = useSessionPolling(sessionId);

  const gameStore = useGameStore((state) => state.actions);
  const game = useGameStore((state) => state.game);
  const isRolling = useGameStore((state) => state.isRolling);
  const currentPlayer = useCurrentPlayer();

  const config = useConfigStore((state) => state);

  useEffect(() => {
    const token = localStorage.getItem("hostToken");
    setHostToken(token);
    setJoinUrl(`${window.location.origin}/join/${sessionId}`);
  }, [sessionId]);

  useEffect(() => {
    if (session?.gameState && session.started) {
      gameStore.setGame(Game.fromJSON(session.gameState));
    }
  }, [session?.gameState, session?.started, gameStore]);

  // Reset selezione vincitore e risposta quiz quando l'azione cambia/termina
  // biome-ignore lint/correctness/useExhaustiveDependencies: reset intenzionale solo al cambio azione
  useEffect(() => {
    setSelectingWinner(false);
    setShowAnswer(false);
  }, [session?.pendingAction?.type, session?.pendingAction?.actorPlayerId]);

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
    setSelectingWinner(false);
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
                playersOn: game
                  .getBoard()
                  .getPlayersOnSquare(index)
                  .map((player) => ({
                    name: player.getName(),
                    isCurrentPlayerTurn:
                      player.getName() === currentPlayer?.getName(),
                  })),
                isMoving: isRolling,
              }),
            )
        : [],
    [game, isRolling, currentPlayer, size],
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
        <div className="flex flex-shrink-0 flex-col items-center justify-center">
          {BoardComponent({ squares: squaresC, cols: 5 })}
        </div>

        {/* Game over overlay */}
        {session.gameOver && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="ui-border-dark mx-4 flex w-full max-w-sm flex-col gap-6 bg-white p-8 text-center">
              <h2 className="ui-text-title">Fine partita!</h2>
              <p className="ui-text-subtitle">
                Vince: <strong>{session.gameOver.winnerName}</strong>
              </p>
              <Link href={URL_HOME}>
                <Button color="blue" className="mx-0">
                  Torna alla home
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Battle overlay */}
        {pendingAction?.type === "battle" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="ui-border-dark mx-4 flex w-full max-w-lg flex-col gap-6 bg-white p-8">
              <h2 className="ui-text-title text-center">Battaglia!</h2>
              <p className="ui-text-subtitle text-center">
                Carta, forbice, sasso — chi ha vinto?
              </p>
              <div className="flex">
                {[pendingAction.actorPlayerId, pendingAction.targetPlayerId]
                  .filter((pid): pid is string => !!pid)
                  .map((pid) => {
                    const name = session.players.find(
                      (p) => p.id === pid,
                    )?.name;
                    return (
                      <Button
                        key={pid}
                        color="red"
                        onClick={() => resolveBattleAsHost(pid)}
                        disabled={isResolving}
                        className="mx-1 flex-1"
                      >
                        {name}
                      </Button>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {/* Overlay unificato per tutte le azioni speciali non-battaglia */}
        {pendingAction &&
          pendingAction.type !== "battle" &&
          (() => {
            const actorName = session.players.find(
              (p) => p.id === pendingAction.actorPlayerId,
            )?.name;
            const targetName = pendingAction.targetPlayerId
              ? session.players.find(
                  (p) => p.id === pendingAction.targetPlayerId,
                )?.name
              : null;
            const nonActorPlayers = session.players.filter(
              (p) => p.id !== pendingAction.actorPlayerId,
            );
            const isMimeLike = MIME_LIKE.includes(pendingAction.type);

            const {
              text: cardTitle,
              body: cardBody,
              imageUrl: cardImageUrl,
            } = getCardDisplay(pendingAction.card);

            // Tipi in cui il testo della carta è segreto: il topic è visibile solo sul dispositivo del giocatore
            const HIDE_CARD_ON_HOST = [
              "face-emotion",
              "backwrite",
              "mime",
              "dictation-draw",
            ];
            const showCardTitle =
              !HIDE_CARD_ON_HOST.includes(pendingAction.type) && !!cardTitle;
            // La risposta separata è rilevante solo per il quiz
            const showCardAnswer = pendingAction.type === "quiz" && !!cardBody;

            return (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="ui-border-dark mx-4 flex w-full max-w-lg flex-col gap-6 bg-white p-8">
                  <h2 className="ui-text-title text-center">
                    {ACTION_LABELS[pendingAction.type] ?? pendingAction.type}
                  </h2>

                  <p className="ui-text-subtitle text-center">
                    {actorName}
                    {targetName && <> → {targetName}</>}
                  </p>

                  {/* Immagine (face-emotion, dictation-draw) */}
                  {cardImageUrl && (
                    <Image
                      width={200}
                      height={200}
                      src={`${imagePrefix}${cardImageUrl}`}
                      alt="card"
                      className="ui-border-dark mx-auto max-w-xs rounded"
                    />
                  )}

                  {/* Testo carta (nascosto per face-emotion: il nome emozione è la risposta) */}
                  {showCardTitle && (
                    <div className="ui-border-dark bg-gray-100 p-4 text-center">
                      <p className="ui-text-subtitle">{cardTitle}</p>
                    </div>
                  )}

                  {/* Risposta/soluzione nascosta: quiz (cardBody), backwrite e mime (cardTitle) */}
                  {(() => {
                    const showForQuiz = showCardAnswer;
                    const showForBackwrite =
                      pendingAction.type === "backwrite" && !!cardTitle;
                    const showForMime =
                      pendingAction.type === "mime" && !!cardTitle;
                    if (!showForQuiz && !showForBackwrite && !showForMime)
                      return null;
                    const revealLabel =
                      pendingAction.type === "mime"
                        ? "Mostra soluzione"
                        : "Mostra risposta";
                    const revealValue =
                      pendingAction.type === "quiz" ? cardBody : cardTitle;
                    return showAnswer ? (
                      <div className="ui-border-dark bg-green-50 p-4 text-center">
                        <p className="ui-text-normal text-green-700">
                          {pendingAction.type === "mime"
                            ? "Soluzione"
                            : "Risposta"}
                          : <strong>{revealValue}</strong>
                        </p>
                      </div>
                    ) : (
                      <Button
                        color="blue"
                        onClick={() => setShowAnswer(true)}
                        className="mx-0"
                      >
                        {revealLabel}
                      </Button>
                    );
                  })()}

                  {/* Backwrite/DictationDraw: attesa scelta target da parte del giocatore */}
                  {(pendingAction.type === "backwrite" ||
                    pendingAction.type === "dictation-draw") &&
                    !pendingAction.targetPlayerId && (
                      <p className="ui-text-normal text-center text-gray-500">
                        {pendingAction.type === "backwrite"
                          ? "In attesa che il giocatore scelga a chi scrivere..."
                          : "In attesa che il giocatore scelga a chi dettare..."}
                      </p>
                    )}

                  {/* Step 1: Riuscito / Non riuscito (backwrite/dictation-draw: solo dopo scelta target) */}
                  {!selectingWinner &&
                    ((pendingAction.type !== "backwrite" &&
                      pendingAction.type !== "dictation-draw") ||
                      !!pendingAction.targetPlayerId) && (
                      <div className="flex">
                        <Button
                          color="green"
                          disabled={isResolving}
                          onClick={() => {
                            if (isMimeLike) {
                              setSelectingWinner(true);
                            } else {
                              void resolveActionAsHost(true);
                            }
                          }}
                          className="mx-1 flex-1"
                        >
                          Riuscito
                        </Button>
                        <Button
                          color="red"
                          disabled={isResolving}
                          onClick={() => void resolveActionAsHost(false)}
                          className="mx-1 flex-1"
                        >
                          Non riuscito
                        </Button>
                      </div>
                    )}

                  {/* Step 2 (mime-like): selezione chi ha indovinato */}
                  {selectingWinner && (
                    <div className="flex flex-col gap-3">
                      <p className="ui-text-subtitle text-center">
                        Chi ha indovinato?
                      </p>
                      {nonActorPlayers.map((p) => (
                        <Button
                          key={p.id}
                          color="blue"
                          disabled={isResolving}
                          onClick={() => void resolveWithWinner(p.id)}
                          className="mx-0"
                        >
                          {p.name}
                        </Button>
                      ))}
                      <Button
                        color="red"
                        onClick={() => setSelectingWinner(false)}
                        className="mx-0"
                      >
                        Annulla
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
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
