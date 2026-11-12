import { NextResponse } from "next/server";
import { battlePendingAction, toPendingAction } from "@/lib/pending-action";
import {
  getSession,
  saveSession,
  toPublicSession,
  withSessionLock,
} from "@/lib/session-store";
import { Battle } from "@/model/battle";
import { BackWrite } from "@/model/deck/backwrite";
import { Card } from "@/model/deck/card";
import { DictationDraw } from "@/model/deck/dictation-draw";
import { EmotionVideo } from "@/model/deck/emotion-video";
import { FaceEmotion } from "@/model/deck/face-emotion";
import { Mime } from "@/model/deck/mime";
import { MusicEmotion } from "@/model/deck/music-emotion";
import { PhysicalTest } from "@/model/deck/physical-test";
import { Quiz } from "@/model/deck/quiz";
import { WhatWouldYouDo } from "@/model/deck/what-would-you-do";
import { Game } from "@/model/game";
import { firstBattle } from "@/model/managers/action-result";
import type { PendingAction, SessionState } from "@/types/session";

function nextPlayerId(game: Game): string {
  const players = game.getPlayers();
  return String(players[game.getTurn() % players.length].getId());
}

function toCard(raw: unknown): Card {
  if (raw && typeof raw === "object" && "cardTitle" in raw) {
    const c = raw as { cardTitle: string; cardText: string };
    return new Card(c.cardTitle, c.cardText ?? c.cardTitle);
  }
  const s = String(raw ?? "");
  return new Card(s, s);
}

// Tutte le azioni sono risolte dall'host (il player mostra solo la cosa segreta)
const HOST_RESOLVED_ACTIONS = [
  "quiz",
  "battle",
  "mime",
  "backwrite",
  "face-emotion",
  "emotion-video",
  "music-emotion",
  "physical-test",
  "what-would-you-do",
  "dictation-draw",
];

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const {
    playerId,
    hostToken,
    success,
    winnerId,
  }: {
    playerId?: string;
    hostToken?: string;
    success: boolean;
    winnerId?: string;
  } = await req.json();

  return withSessionLock(id, async () => {
    const session = await getSession(id);
    if (!session?.started || !session.gameState)
      return NextResponse.json({ error: "Game not active" }, { status: 400 });

    const pendingAction = session.pendingAction;
    if (!pendingAction)
      return NextResponse.json({ error: "No pending action" }, { status: 409 });

    // Verifica autorizzazione
    const isHostResolved = HOST_RESOLVED_ACTIONS.includes(pendingAction.type);
    if (isHostResolved) {
      if (!hostToken || session.hostToken !== hostToken)
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    } else {
      if (pendingAction.actorPlayerId !== playerId)
        return NextResponse.json(
          { error: "No pending action for this player" },
          { status: 409 },
        );
    }

    const game = Game.fromJSON(session.gameState);
    const gamePlayers = game.getPlayers();

    // Ricostruisce Player dal numeric id (String → Number)
    const actorPlayer = gamePlayers.find(
      (p) => String(p.getId()) === pendingAction.actorPlayerId,
    );
    if (!actorPlayer)
      return NextResponse.json({ error: "Actor not found" }, { status: 400 });
    const targetPlayer = pendingAction.targetPlayerId
      ? gamePlayers.find(
          (p) => String(p.getId()) === pendingAction.targetPlayerId,
        )
      : undefined;
    if (pendingAction.targetPlayerId && !targetPlayer)
      return NextResponse.json({ error: "Target not found" }, { status: 400 });

    // card può essere primitivo o { topic, imageUrl } per FaceEmotion/DictationDraw,
    // { topic, videoUrl } per EmotionVideo
    const cardData = pendingAction.card as
      | string
      | { topic: string; imageUrl?: string; videoUrl?: string };
    // Le carte senza immagine sono salvate così come sono, senza "topic"
    const cardTopic =
      typeof cardData === "object" && cardData !== null && "topic" in cardData
        ? cardData.topic
        : cardData;
    const imageUrl =
      typeof cardData === "object" && cardData !== null
        ? (cardData.imageUrl ?? "")
        : "";
    const videoUrl =
      typeof cardData === "object" && cardData !== null
        ? (cardData.videoUrl ?? "")
        : "";

    // La battaglia ha logica di follow-up propria — gestita separatamente
    if (pendingAction.type === "battle") {
      const p1 = gamePlayers.find(
        (p) => String(p.getId()) === pendingAction.actorPlayerId,
      );
      const p2 = gamePlayers.find(
        (p) => String(p.getId()) === pendingAction.targetPlayerId,
      );
      if (!p1 || !p2)
        return NextResponse.json(
          { error: "Battle players not found" },
          { status: 400 },
        );
      const battle = new Battle(p1, p2);
      const winnerPlayer = gamePlayers.find(
        (p) => String(p.getId()) === winnerId,
      );
      if (!winnerPlayer)
        return NextResponse.json({ error: "Invalid winner" }, { status: 400 });

      // Dopo la vittoria il giocatore avanza: può nascere un'altra battaglia
      // o attivarsi la sfida della casella raggiunta, eseguita dal vincitore
      const followUp = game.resolveBattle(battle, winnerPlayer);
      return finishAction(
        id,
        session,
        game,
        toPendingAction(followUp, String(winnerPlayer.getId())),
      );
    }

    // Per mime/backwrite/dictation-draw: l'host sceglie il vincitore (winnerId),
    // altrimenti si usa il targetPlayer pre-impostato.
    const resolveWinner = (fallback: typeof targetPlayer) =>
      success
        ? winnerId
          ? gamePlayers.find((p) => String(p.getId()) === winnerId)
          : fallback
        : undefined;

    // Le sfide che fanno avanzare i giocatori possono causare collisioni
    let collisions: Parameters<typeof firstBattle>[0] = null;
    switch (pendingAction.type) {
      case "mime":
        collisions = game.resolveMime(
          new Mime(actorPlayer, toCard(cardTopic)),
          success,
          resolveWinner(targetPlayer),
        );
        break;
      case "quiz":
        collisions = game.resolveQuiz(
          new Quiz(actorPlayer, toCard(cardTopic)),
          success,
        );
        break;
      case "backwrite":
        collisions = game.resolveBackWrite(
          new BackWrite(actorPlayer, toCard(cardTopic)),
          success,
          resolveWinner(targetPlayer),
        );
        break;
      case "face-emotion":
        collisions = game.resolveFaceEmotion(
          new FaceEmotion(actorPlayer, toCard(cardTopic), imageUrl),
          success,
        );
        break;
      case "emotion-video":
        collisions = game.resolveEmotionVideo(
          new EmotionVideo(actorPlayer, toCard(cardTopic), videoUrl),
          success,
        );
        break;
      case "music-emotion":
        collisions = game.resolveMusicEmotion(
          new MusicEmotion(actorPlayer, toCard(cardTopic)),
          success,
        );
        break;
      case "physical-test":
        collisions = game.resolvePhysicalTest(
          new PhysicalTest(actorPlayer, toCard(cardTopic)),
          success,
        );
        break;
      case "what-would-you-do":
        collisions = game.resolveWhatWouldYouDo(
          new WhatWouldYouDo(actorPlayer, toCard(cardTopic)),
          success,
        );
        break;
      case "dictation-draw":
        collisions = game.resolveDictationDraw(
          new DictationDraw(actorPlayer, toCard(cardTopic), imageUrl),
          success,
          resolveWinner(targetPlayer),
        );
        break;
    }

    const partner = success ? resolveWinner(targetPlayer) : undefined;
    const battle = firstBattle(
      collisions,
      partner ? [actorPlayer, partner] : [],
    );
    return finishAction(
      id,
      session,
      game,
      battle ? battlePendingAction(battle) : null,
    );
  });
}

/**
 * Salva lo stato dopo la risoluzione di un'azione.
 * Se è nata una nuova azione (battaglia o sfida) resta in attesa dell'host,
 * altrimenti il turno passa al giocatore successivo.
 */
async function finishAction(
  id: string,
  session: SessionState,
  game: Game,
  next: PendingAction | null,
): Promise<Response> {
  session.gameState = game.toJSON();
  session.diceResult = null;
  session.lastMoveInfo = null;

  if (game.isGameEnded()) {
    session.gameOver = { winnerName: game.getWinner()?.getName() ?? "" };
    session.currentPlayerId = null;
    session.pendingAction = null;
  } else if (next) {
    session.pendingAction = next;
  } else {
    session.pendingAction = null;
    session.currentPlayerId = nextPlayerId(game);
  }

  await saveSession(id, session);
  return NextResponse.json(toPublicSession(session));
}
