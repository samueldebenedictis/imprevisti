import { NextResponse } from "next/server";
import { getSession, saveSession, toPublicSession } from "@/lib/session-store";
import { Battle } from "@/model/battle";
import { BackWrite } from "@/model/deck/backwrite";
import { Card } from "@/model/deck/card";
import { DictationDraw } from "@/model/deck/dictation-draw";
import { FaceEmotion } from "@/model/deck/face-emotion";
import { Mime } from "@/model/deck/mime";
import { MusicEmotion } from "@/model/deck/music-emotion";
import { PhysicalTest } from "@/model/deck/physical-test";
import { Quiz } from "@/model/deck/quiz";
import { WhatWouldYouDo } from "@/model/deck/what-would-you-do";
import { Game } from "@/model/game";

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

  // card può essere primitivo o { topic, imageUrl } per FaceEmotion/DictationDraw
  const cardData = pendingAction.card as
    | string
    | { topic: string; imageUrl: string };
  const cardTopic =
    typeof cardData === "object" && cardData !== null
      ? cardData.topic
      : cardData;
  const imageUrl =
    typeof cardData === "object" && cardData !== null ? cardData.imageUrl : "";

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

    const followUp = game.resolveBattle(battle, winnerPlayer);
    session.gameState = game.toJSON();
    session.diceResult = null;
    session.lastMoveInfo = null;

    if (game.isGameEnded()) {
      session.gameOver = { winnerName: game.getWinner()?.getName() ?? "" };
      session.currentPlayerId = null;
      session.pendingAction = null;
    } else if (followUp.type === "battle") {
      const fb = followUp.data as Battle;
      const [fp1, fp2] = fb.getPlayers();
      session.pendingAction = {
        type: "battle",
        card: null,
        actorPlayerId: String(fp1.getId()),
        targetPlayerId: String(fp2.getId()),
      };
    } else {
      session.pendingAction = null;
      session.currentPlayerId = nextPlayerId(game);
    }

    await saveSession(id, session);
    return NextResponse.json(toPublicSession(session));
  }

  // Per mime/backwrite/dictation-draw: l'host sceglie il vincitore (winnerId),
  // altrimenti si usa il targetPlayer pre-impostato.
  const resolveWinner = (fallback: typeof targetPlayer) =>
    success
      ? winnerId
        ? gamePlayers.find((p) => String(p.getId()) === winnerId)
        : fallback
      : undefined;

  switch (pendingAction.type) {
    case "mime":
      game.resolveMime(
        new Mime(actorPlayer, toCard(cardTopic)),
        success,
        resolveWinner(targetPlayer),
      );
      break;
    case "quiz":
      game.resolveQuiz(new Quiz(actorPlayer, toCard(cardTopic)), success);
      break;
    case "backwrite":
      game.resolveBackWrite(
        new BackWrite(actorPlayer, toCard(cardTopic)),
        success,
        resolveWinner(targetPlayer),
      );
      break;
    case "face-emotion":
      game.resolveFaceEmotion(
        new FaceEmotion(actorPlayer, toCard(cardTopic), imageUrl),
        success,
      );
      break;
    case "music-emotion":
      game.resolveMusicEmotion(
        new MusicEmotion(actorPlayer, toCard(cardTopic)),
        success,
      );
      break;
    case "physical-test":
      game.resolvePhysicalTest(
        new PhysicalTest(actorPlayer, toCard(cardTopic)),
        success,
      );
      break;
    case "what-would-you-do":
      game.resolveWhatWouldYouDo(
        new WhatWouldYouDo(actorPlayer, toCard(cardTopic)),
        success,
      );
      break;
    case "dictation-draw":
      game.resolveDictationDraw(
        new DictationDraw(actorPlayer, toCard(cardTopic), imageUrl),
        success,
        resolveWinner(targetPlayer),
      );
      break;
  }

  session.gameState = game.toJSON();
  session.pendingAction = null;
  session.diceResult = null;
  session.lastMoveInfo = null;

  if (game.isGameEnded()) {
    session.gameOver = { winnerName: game.getWinner()?.getName() ?? "" };
    session.currentPlayerId = null;
  } else {
    session.currentPlayerId = nextPlayerId(game);
  }

  await saveSession(id, session);
  return NextResponse.json(toPublicSession(session));
}
