import Image from "next/image";
import { getCardDisplay } from "@/lib/card-utils";
import { imagePrefix } from "../image-prefix";
import { ACTION_LABELS } from "./action-labels";
import SpectatorSpinner from "./spectator-spinner";
import Button from "./ui/button";

const TARGET_INSTRUCTIONS: Record<string, string> = {
  backwrite: "Senti cosa ti scrivono sulla schiena e indovina la parola!",
  "dictation-draw": "Disegna quello che ti descrivono!",
};

const TARGET_SELECTION_PROMPTS: Record<string, string> = {
  backwrite: "A chi vuoi scrivere?",
  "dictation-draw": "A chi vuoi disegnare?",
};

type PlayerActionViewProps =
  | {
      phase: "target-selection";
      actionType: string;
      otherPlayers: { id: string; name: string }[];
      onSelectTarget: (targetId: string) => void;
    }
  | {
      phase: "quiz-actor";
      quizQuestion: string;
    }
  | {
      phase: "actor";
      actionType: string;
      card: unknown;
    }
  | {
      phase: "target";
      actionType: string;
    }
  | {
      phase: "spectator";
      actorName?: string;
    };

export default function PlayerActionView(props: PlayerActionViewProps) {
  if (props.phase === "target-selection") {
    return (
      <div className="ui-text-dark my-8 flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
        <h2 className="ui-text-title">
          {ACTION_LABELS[props.actionType] ?? props.actionType}
        </h2>
        <p className="ui-text-subtitle">
          {TARGET_SELECTION_PROMPTS[props.actionType] ?? "Chi scegli?"}
        </p>
        <div className="flex w-full max-w-sm flex-col gap-3">
          {props.otherPlayers.map((p) => (
            <Button
              key={p.id}
              color="blue"
              onClick={() => props.onSelectTarget(p.id)}
              className="mx-0"
            >
              {p.name}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  if (props.phase === "quiz-actor") {
    return (
      <div className="ui-text-dark my-8 flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
        <h2 className="ui-text-title">Quiz!</h2>
        {props.quizQuestion && (
          <div className="ui-border-dark w-full max-w-sm bg-gray-100 p-6 text-center">
            <p className="ui-text-subtitle">{props.quizQuestion}</p>
          </div>
        )}
        <p className="ui-text-normal text-gray-500">
          Il coordinatore giudicherà la risposta.
        </p>
      </div>
    );
  }

  if (props.phase === "actor") {
    const { text: cardText, imageUrl } = getCardDisplay(props.card);
    const showCardText = props.actionType !== "face-emotion";
    return (
      <div className="ui-text-dark my-8 flex min-h-screen flex-col items-center justify-center gap-6 p-8">
        <h2 className="ui-text-title">
          {ACTION_LABELS[props.actionType] ?? props.actionType}
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
      </div>
    );
  }

  if (props.phase === "target") {
    return (
      <div className="ui-text-dark my-8 flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
        <p className="ui-text-subtitle">
          {TARGET_INSTRUCTIONS[props.actionType] ?? "Partecipa all'azione!"}
        </p>
        <p className="ui-text-normal">
          L&apos;altro giocatore deciderà il risultato.
        </p>
      </div>
    );
  }

  // spectator
  return (
    <div className="ui-text-dark my-8 flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <SpectatorSpinner />
      <p className="ui-text-normal">
        <strong>{props.actorName}</strong>
        {" sta eseguendo un'azione..."}
      </p>
    </div>
  );
}
