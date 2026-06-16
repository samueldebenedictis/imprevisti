"use client";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import Dice from "@/app/components/dice";
import { IdleOverlay } from "@/app/components/idle-overlay";
import Button from "@/app/components/ui/button";
// playerId viene dall'URL — persiste alla chiusura del tab
import { imagePrefix } from "@/app/image-prefix";
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
} from "@/app/texts";
import { getCardDisplay } from "@/lib/card-utils";
import { useSessionPolling } from "@/lib/use-session-polling";
import { Game } from "@/model/game";
import type { LastMoveInfo, PublicSessionState } from "@/types/session";

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

const TARGET_INSTRUCTIONS: Record<string, string> = {
  mime: "Guarda e indovina cosa sta mimando!",
  backwrite: "Senti cosa ti scrivono sulla schiena e indovina la parola!",
  "dictation-draw": "Disegna quello che ti descrivono!",
};

function LandingBanner({ info }: { info: LastMoveInfo }) {
  if (info.diceResult === 0) {
    return (
      <div className="ui-border-dark w-full max-w-sm bg-gray-100 p-4 text-center">
        <p className="ui-text-subtitle text-red-600">Turno saltato!</p>
      </div>
    );
  }
  return (
    <div className="ui-border-dark w-full max-w-sm bg-gray-100 p-4 text-center">
      <p className="ui-text-normal">
        Casella <strong>{info.squareNumber}</strong>
        {info.squareType !== "normal" && info.squareType !== "move" && (
          <> · {ACTION_LABELS[info.squareType] ?? info.squareType}</>
        )}
      </p>
    </div>
  );
}

export default function PlayerPage() {
  const { sessionId, playerId } = useParams<{
    sessionId: string;
    playerId: string;
  }>();
  const [isRolling, setIsRolling] = useState(false);
  const [localDiceResult, setLocalDiceResult] = useState<number | null>(null);
  const [localMoveInfo, setLocalMoveInfo] = useState<LastMoveInfo | null>(null);
  const { session, error, idleState, resume } = useSessionPolling(sessionId);

  // Usato per rilevare quando pendingAction sparisce (azione risolta)
  const prevPendingAction = useRef(session?.pendingAction);
  useEffect(() => {
    if (!session) return; // skip su errore rete: session null non indica azione risolta
    if (prevPendingAction.current && !session.pendingAction) {
      // L'azione è stata appena risolta: azzera info stantia dal lancio
      setLocalMoveInfo(null);
      setLocalDiceResult(null);
    }
    prevPendingAction.current = session.pendingAction;
  }, [session, session?.pendingAction]);

  const playersPositions = useMemo(() => {
    if (!session?.gameState) return [];
    try {
      const game = Game.fromJSON(session.gameState);
      return game.getPlayers().map((p) => ({
        id: String(p.getId()),
        name: p.getName(),
        position: game.getPlayerPosition(p),
      }));
    } catch {
      return [];
    }
  }, [session?.gameState]);

  const action = session?.pendingAction;
  const isMyTurn =
    session?.currentPlayerId === playerId && !session?.pendingAction;
  const isActor = action?.actorPlayerId === playerId;
  const isTarget = action?.targetPlayerId === playerId;

  const rollDice = async () => {
    setIsRolling(true);
    try {
      const [res] = await Promise.all([
        fetch(`/api/sessions/${sessionId}/roll`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ playerId }),
        }).then((r) => r.json() as Promise<PublicSessionState>),
        new Promise<void>((r) => setTimeout(r, 1200)),
      ]);
      setLocalDiceResult(res.diceResult);
      setLocalMoveInfo(res.lastMoveInfo ?? null);
    } catch {
      // fetch fallita: nessun aggiornamento, il polling riprenderà lo stato corretto
    } finally {
      setIsRolling(false);
    }
  };

  if (!session) {
    return (
      <div className="ui-text-dark flex min-h-screen items-center justify-center">
        <p className="ui-text-normal">{error ?? "Caricamento..."}</p>
      </div>
    );
  }

  if (session.gameOver) {
    return (
      <div className="ui-text-dark my-8 flex min-h-screen flex-col items-center justify-center gap-4 p-8">
        <h2 className="ui-text-title">Fine partita!</h2>
        <p className="ui-text-subtitle">
          Vince: <strong>{session.gameOver.winnerName}</strong>
        </p>
      </div>
    );
  }

  if (!session.started) {
    return (
      <>
        <div className="ui-text-dark my-8 flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
          <p className="ui-text-subtitle">
            In attesa che l&apos;host avvii la partita...
          </p>
          <p className="ui-text-normal">
            {session.players.length} giocatori connessi
          </p>
        </div>
        <IdleOverlay idleState={idleState} onResume={resume} />
      </>
    );
  }

  // Backwrite/DictationDraw senza target: l'attore sceglie il bersaglio
  const needsTargetSelection =
    isActor &&
    action &&
    (action.type === "backwrite" || action.type === "dictation-draw") &&
    !action.targetPlayerId;

  if (needsTargetSelection) {
    const otherPlayers = session.players.filter((p) => p.id !== playerId);
    const label =
      action.type === "backwrite"
        ? "A chi vuoi scrivere?"
        : "A chi vuoi dettare?";
    const selectTarget = async (targetId: string) => {
      await fetch(`/api/sessions/${sessionId}/select-target`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId, targetId }),
      });
    };
    return (
      <>
        <div className="ui-text-dark my-8 flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
          <h2 className="ui-text-title">
            {ACTION_LABELS[action?.type] ?? action?.type}
          </h2>
          <p className="ui-text-subtitle">{label}</p>
          <div className="flex w-full max-w-sm flex-col gap-3">
            {otherPlayers.map((p) => (
              <Button
                key={p.id}
                color="blue"
                onClick={() => void selectTarget(p.id)}
                className="mx-0"
              >
                {p.name}
              </Button>
            ))}
          </div>
        </div>
        <IdleOverlay idleState={idleState} onResume={resume} />
      </>
    );
  }

  // Quiz: risponde verbalmente, coordinatore giudica sull'host
  if (isActor && action?.type === "quiz") {
    const quizCard = action.card as { cardTitle?: string } | null;
    const quizQuestion = quizCard?.cardTitle ?? "";
    return (
      <>
        <div className="ui-text-dark my-8 flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
          <h2 className="ui-text-title">Quiz!</h2>
          {quizQuestion && (
            <div className="ui-border-dark w-full max-w-sm bg-gray-100 p-6 text-center">
              <p className="ui-text-subtitle">{quizQuestion}</p>
            </div>
          )}
          <p className="ui-text-normal text-gray-500">
            Il coordinatore giudicherà la risposta.
          </p>
          <PlayersPanel positions={playersPositions} selfId={playerId} />
        </div>
        <IdleOverlay idleState={idleState} onResume={resume} />
      </>
    );
  }

  // Actor: vede la cosa segreta (parola da mimare, parola da scrivere, immagine)
  if (isActor && action) {
    const { text: cardText, imageUrl } = getCardDisplay(action.card);
    const showCardText = action.type !== "face-emotion";

    return (
      <>
        <div className="ui-text-dark my-8 flex min-h-screen flex-col items-center justify-center gap-6 p-8">
          <h2 className="ui-text-title">
            {ACTION_LABELS[action.type] ?? action.type}
          </h2>
          {imageUrl && (
            <Image
              width={200}
              height={200}
              src={`${imagePrefix}${imageUrl}`}
              alt="emotion"
              className="ui-border-dark w-full max-w-xs rounded"
            />
          )}
          {showCardText && cardText && (
            <div className="ui-border-dark w-full max-w-sm bg-gray-100 p-6 text-center">
              <p className="ui-text-subtitle">{String(cardText)}</p>
            </div>
          )}
          <p className="ui-text-normal text-center text-gray-500">
            Il coordinatore giudica sul tabellone.
          </p>
          <PlayersPanel positions={playersPositions} selfId={playerId} />
        </div>
        <IdleOverlay idleState={idleState} onResume={resume} />
      </>
    );
  }

  // Target: NON vede la card
  if (isTarget && action) {
    return (
      <>
        <div className="ui-text-dark my-8 flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
          <p className="ui-text-subtitle">
            {TARGET_INSTRUCTIONS[action.type] ?? "Partecipa all'azione!"}
          </p>
          <p className="ui-text-normal">
            L&apos;altro giocatore deciderà il risultato.
          </p>
          <PlayersPanel positions={playersPositions} selfId={playerId} />
        </div>
        <IdleOverlay idleState={idleState} onResume={resume} />
      </>
    );
  }

  // Spectator
  if (action) {
    const actorName = session.players.find(
      (p) => p.id === action.actorPlayerId,
    )?.name;
    return (
      <>
        <div className="ui-text-dark my-8 flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
          <p className="ui-text-normal">
            <strong>{actorName}</strong> sta eseguendo un&apos;azione...
          </p>
          <PlayersPanel positions={playersPositions} selfId={playerId} />
        </div>
        <IdleOverlay idleState={idleState} onResume={resume} />
      </>
    );
  }

  // Turno del giocatore: dado + risultato atterraggio
  if (isMyTurn) {
    const showResult = !isRolling && localDiceResult !== null;
    const skipTurn = localDiceResult === 0;

    return (
      <>
        <div className="ui-text-dark my-8 flex min-h-screen flex-col items-center justify-center gap-6 p-8">
          <p className="ui-text-subtitle">È il tuo turno!</p>
          {!skipTurn && (
            <button
              type="button"
              disabled={showResult || isRolling}
              className="mt-4 flex items-center justify-center disabled:cursor-default"
              onClick={!showResult && !isRolling ? rollDice : undefined}
            >
              <Dice isRolling={isRolling} result={localDiceResult} />
            </button>
          )}
          {showResult && localMoveInfo && (
            <LandingBanner info={localMoveInfo} />
          )}
          {!showResult && (
            <Button
              color="green"
              onClick={rollDice}
              disabled={isRolling}
              className="mx-0 w-full max-w-sm"
            >
              {isRolling ? "Lancio..." : "Lancia il dado"}
            </Button>
          )}
          <PlayersPanel positions={playersPositions} selfId={playerId} />
        </div>
        <IdleOverlay idleState={idleState} onResume={resume} />
      </>
    );
  }

  // Attesa: turno di un altro giocatore
  const currentPlayerName = session.players.find(
    (p) => p.id === session.currentPlayerId,
  )?.name;
  return (
    <>
      <div className="ui-text-dark my-8 flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
        <p className="ui-text-normal">
          Turno di <strong>{currentPlayerName ?? "..."}</strong>
        </p>
        <PlayersPanel positions={playersPositions} selfId={playerId} />
      </div>
      <IdleOverlay idleState={idleState} onResume={resume} />
    </>
  );
}

function PlayersPanel({
  positions,
  selfId,
}: {
  positions: Array<{ id: string; name: string; position: number }>;
  selfId: string | null;
}) {
  if (positions.length === 0) return null;
  const self = positions.find((p) => p.id === selfId);
  const others = positions.filter((p) => p.id !== selfId);
  const ordered = self ? [self, ...others] : positions;
  return (
    <div className="ui-border-dark mt-4 w-full max-w-sm bg-gray-100 p-4 text-left">
      <p className="ui-text-normal mb-2 font-semibold">Posizione giocatori</p>
      <ul className="ui-text-normal">
        {ordered.map((p) => (
          <li key={p.id} className={p.id === selfId ? "font-bold" : ""}>
            <span className={p.id === selfId ? "text-blue-500" : ""}>
              {p.name}
            </span>
            : {p.position}
          </li>
        ))}
      </ul>
    </div>
  );
}
