import Image from "next/image";
import { useEffect, useState } from "react";
import { getCardDisplay } from "@/lib/card-utils";
import type { PendingAction } from "@/types/session";
import { imagePrefix } from "../image-prefix";
import { ACTION_LABELS } from "./action-labels";
import Button from "./ui/button";

// Azioni che richiedono selezione del vincitore dopo "Riuscito"
const MIME_LIKE = ["mime", "dictation-draw"];

// Tipi in cui il testo della carta è segreto: il topic è visibile solo sul dispositivo del giocatore
const HIDE_CARD_ON_HOST = [
  "face-emotion",
  "backwrite",
  "mime",
  "dictation-draw",
];

export interface HostActionOverlayProps {
  pendingAction: PendingAction;
  players: { id: string; name: string }[];
  onResolve: (success: boolean) => void;
  onResolveWithWinner: (winnerId: string) => void;
  isResolving?: boolean;
}

export default function HostActionOverlay({
  pendingAction,
  players,
  onResolve,
  onResolveWithWinner,
  isResolving = false,
}: HostActionOverlayProps) {
  const [selectingWinner, setSelectingWinner] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  // Reset selezione vincitore e risposta quando l'azione cambia/termina
  // biome-ignore lint/correctness/useExhaustiveDependencies: reset intenzionale solo al cambio azione
  useEffect(() => {
    setSelectingWinner(false);
    setShowAnswer(false);
  }, [pendingAction.type, pendingAction.actorPlayerId]);

  const actorName = players.find(
    (p) => p.id === pendingAction.actorPlayerId,
  )?.name;
  const targetName = pendingAction.targetPlayerId
    ? players.find((p) => p.id === pendingAction.targetPlayerId)?.name
    : null;
  const nonActorPlayers = players.filter(
    (p) => p.id !== pendingAction.actorPlayerId,
  );
  const isMimeLike = MIME_LIKE.includes(pendingAction.type);

  const {
    text: cardTitle,
    body: cardBody,
    imageUrl: cardImageUrl,
  } = getCardDisplay(pendingAction.card);

  const showCardTitle =
    !HIDE_CARD_ON_HOST.includes(pendingAction.type) && !!cardTitle;
  // La risposta separata è rilevante solo per il quiz
  const showCardAnswer = pendingAction.type === "quiz" && !!cardBody;

  const showForQuiz = showCardAnswer;
  const showForBackwrite = pendingAction.type === "backwrite" && !!cardTitle;
  const showForMime = pendingAction.type === "mime" && !!cardTitle;
  const showReveal = showForQuiz || showForBackwrite || showForMime;
  const revealLabel =
    pendingAction.type === "mime" ? "Mostra soluzione" : "Mostra risposta";
  const revealValue = pendingAction.type === "quiz" ? cardBody : cardTitle;

  // dictation-draw non arriva mai qui senza target: il server lo assegna
  // automaticamente al roll (TWO_ACTOR_TYPES in roll/route.ts)
  const awaitingTarget =
    pendingAction.type === "backwrite" && !pendingAction.targetPlayerId;

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

        {/* Immagine (face-emotion only — dictation-draw: solo sul dispositivo attore) */}
        {cardImageUrl && pendingAction.type !== "dictation-draw" && (
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
        {showReveal &&
          (showAnswer ? (
            <div className="ui-border-dark bg-green-50 p-4 text-center">
              <p className="ui-text-normal text-green-700">
                {pendingAction.type === "mime" ? "Soluzione" : "Risposta"}:{" "}
                <strong>{revealValue}</strong>
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
          ))}

        {/* Backwrite/DictationDraw: attesa scelta target da parte del giocatore */}
        {awaitingTarget && (
          <p className="ui-text-normal text-center text-gray-500">
            In attesa che il giocatore scelga a chi scrivere...
          </p>
        )}

        {/* Step 1: Riuscito / Non riuscito (backwrite: solo dopo scelta target) */}
        {!selectingWinner && !awaitingTarget && (
          <div className="flex">
            <Button
              color="green"
              disabled={isResolving}
              onClick={() => {
                if (isMimeLike) {
                  setSelectingWinner(true);
                } else {
                  onResolve(true);
                }
              }}
              className="mx-1 flex-1"
            >
              Riuscito
            </Button>
            <Button
              color="red"
              disabled={isResolving}
              onClick={() => onResolve(false)}
              className="mx-1 flex-1"
            >
              Non riuscito
            </Button>
          </div>
        )}

        {/* Step 2 (mime-like): selezione chi ha indovinato */}
        {selectingWinner && (
          <div className="flex flex-col gap-3">
            <p className="ui-text-subtitle text-center">Chi ha indovinato?</p>
            {nonActorPlayers.map((p) => (
              <Button
                key={p.id}
                color="blue"
                disabled={isResolving}
                onClick={() => {
                  setSelectingWinner(false);
                  onResolveWithWinner(p.id);
                }}
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
}
