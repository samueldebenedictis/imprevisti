"use client";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { IdleOverlay } from "@/app/components/idle-overlay";
import PlayerActionView from "@/app/components/player-action-view";
import PlayerGameOverView from "@/app/components/player-game-over-view";
import PlayerRollResultView from "@/app/components/player-roll-result-view";
import PlayerRollView from "@/app/components/player-roll-view";
// playerId viene dall'URL — persiste alla chiusura del tab
import { useSessionPolling } from "@/lib/use-session-polling";
import type { LastMoveInfo, PublicSessionState } from "@/types/session";

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
    return <PlayerGameOverView winnerName={session.gameOver.winnerName} />;
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

  // Lancio in corso: il polling in background può già riflettere lo stato
  // server post-lancio (es. pendingAction di un'azione speciale) prima che
  // il client riceva la risposta della roll — non lasciare che l'azione
  // interrompa l'animazione del dado.
  if (isRolling) {
    return (
      <>
        <PlayerRollView
          isRolling={isRolling}
          onRollDice={() => void rollDice()}
        />
        <IdleOverlay idleState={idleState} onResume={resume} />
      </>
    );
  }

  // Risultato del lancio: pagina intermedia col bottone "Avanti" prima di
  // mostrare direttamente il turno successivo (attesa/azione/spectator).
  if (!isRolling && localDiceResult !== null) {
    return (
      <>
        <PlayerRollResultView
          diceResult={localDiceResult}
          moveInfo={localMoveInfo}
          onContinue={() => {
            setLocalDiceResult(null);
            setLocalMoveInfo(null);
          }}
        />
        <IdleOverlay idleState={idleState} onResume={resume} />
      </>
    );
  }

  // Backwrite senza target: l'attore sceglie il bersaglio.
  // Dictation-draw non passa mai di qui: il server assegna il target
  // automaticamente al roll (TWO_ACTOR_TYPES in roll/route.ts).
  const needsTargetSelection =
    isActor && action && action.type === "backwrite" && !action.targetPlayerId;

  if (needsTargetSelection) {
    const otherPlayers = session.players.filter((p) => p.id !== playerId);
    const selectTarget = async (targetId: string) => {
      await fetch(`/api/sessions/${sessionId}/select-target`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId, targetId }),
      });
    };
    return (
      <>
        <PlayerActionView
          phase="target-selection"
          otherPlayers={otherPlayers}
          onSelectTarget={(targetId) => void selectTarget(targetId)}
        />
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
        <PlayerActionView phase="quiz-actor" quizQuestion={quizQuestion} />
        <IdleOverlay idleState={idleState} onResume={resume} />
      </>
    );
  }

  // Actor: vede la cosa segreta (parola da mimare, parola da scrivere, immagine)
  if (isActor && action) {
    return (
      <>
        <PlayerActionView
          phase="actor"
          actionType={action.type}
          card={action.card}
        />
        <IdleOverlay idleState={idleState} onResume={resume} />
      </>
    );
  }

  // Target: NON vede la card
  if (isTarget && action) {
    return (
      <>
        <PlayerActionView phase="target" actionType={action.type} />
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
        <PlayerActionView phase="spectator" actorName={actorName} />
        <IdleOverlay idleState={idleState} onResume={resume} />
      </>
    );
  }

  // Turno del giocatore: dado + risultato atterraggio
  if (isMyTurn) {
    return (
      <>
        <PlayerRollView
          isRolling={isRolling}
          onRollDice={() => void rollDice()}
        />
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
      </div>
      <IdleOverlay idleState={idleState} onResume={resume} />
    </>
  );
}
