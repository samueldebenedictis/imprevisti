import { NextResponse } from "next/server";
import { getSession, saveSession, toPublicSession } from "@/lib/session-store";
import type { Battle } from "@/model/battle";
import type { BackWrite } from "@/model/deck/backwrite";
import type { Card } from "@/model/deck/card";
import type { DictationDraw } from "@/model/deck/dictation-draw";
import type { FaceEmotion } from "@/model/deck/face-emotion";
import type { Mime } from "@/model/deck/mime";
import type { MusicEmotion } from "@/model/deck/music-emotion";
import type { PhysicalTest } from "@/model/deck/physical-test";
import type { Quiz } from "@/model/deck/quiz";
import type { WhatWouldYouDo } from "@/model/deck/what-would-you-do";
import { Game } from "@/model/game";
import type { GameActionResult } from "@/model/managers/types";
import type { PendingAction } from "@/types/session";

// dictation-draw auto-seleziona il prossimo giocatore come target
// mime e backwrite NO: è l'attore a scegliere (via /select-target)
const TWO_ACTOR_TYPES = ["dictation-draw"];

function extractCard(result: GameActionResult): {
  card: Card;
  imageUrl?: string;
} {
  switch (result.type) {
    case "mime":
      return { card: (result.data as Mime).cardTopic };
    case "quiz":
      return { card: (result.data as Quiz).cardTopic };
    case "backwrite":
      return { card: (result.data as BackWrite).cardTopic };
    case "music-emotion":
      return { card: (result.data as MusicEmotion).cardEmotion };
    case "physical-test":
      return { card: (result.data as PhysicalTest).cardTest };
    case "what-would-you-do":
      return { card: (result.data as WhatWouldYouDo).cardQuestion };
    case "face-emotion": {
      const d = result.data as FaceEmotion;
      return { card: d.cardEmotion, imageUrl: d.imageUrl };
    }
    case "dictation-draw": {
      const d = result.data as DictationDraw;
      return { card: d.cardTopic, imageUrl: d.imageUrl };
    }
    default:
      return { card: { cardTitle: "", cardText: "" } as Card };
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { playerId }: { playerId: string } = await req.json();

  const session = await getSession(id);
  if (!session?.started || !session.gameState)
    return NextResponse.json({ error: "Game not active" }, { status: 400 });
  if (session.currentPlayerId !== playerId)
    return NextResponse.json({ error: "Not your turn" }, { status: 403 });
  if (session.pendingAction)
    return NextResponse.json({ error: "Action pending" }, { status: 409 });

  // Pulisce il risultato del turno precedente
  session.diceResult = null;
  session.lastMoveInfo = null;

  const game = Game.fromJSON(session.gameState);
  const gamePlayers = game.getPlayers();
  const actorPlayer = gamePlayers.find((p) => String(p.getId()) === playerId);
  const result = game.playTurn();

  session.gameState = game.toJSON();
  session.diceResult = result.diceResult;

  // Registra dove è atterrato il giocatore
  if (actorPlayer) {
    const newPos = game.getPlayerPosition(actorPlayer);
    const squares = game.getBoard().getSquares();
    const square = squares[newPos];
    session.lastMoveInfo = {
      actorPlayerId: playerId,
      diceResult: result.diceResult,
      squareNumber: square?.getNumber() ?? newPos,
      squareType: square?.getType() ?? "move",
    };
  }

  if (game.isGameEnded()) {
    const winner = game.getWinner();
    session.gameOver = { winnerName: winner?.getName() ?? "" };
    session.currentPlayerId = null;
    session.pendingAction = null;
  } else if (result.type === "battle") {
    const battle = result.data as Battle;
    const [p1, p2] = battle.getPlayers();
    session.pendingAction = {
      type: "battle",
      card: null,
      actorPlayerId: String(p1.getId()),
      targetPlayerId: String(p2.getId()),
    };
    // currentPlayerId rimane invariato — l'host risolve la battaglia
  } else if (result.type !== "none") {
    const players = game.getPlayers();
    const nextIndex = game.getTurn() % players.length;
    const targetPlayerId = String(players[nextIndex].getId());

    const { card, imageUrl } = extractCard(result);
    const pendingAction: PendingAction = {
      type: result.type,
      card: imageUrl !== undefined ? { topic: card, imageUrl } : card,
      actorPlayerId: playerId,
      targetPlayerId: TWO_ACTOR_TYPES.includes(result.type)
        ? targetPlayerId
        : undefined,
    };

    session.pendingAction = pendingAction;
    // currentPlayerId rimane l'actor: decide riuscito/non riuscito
  } else {
    // Nessuna azione speciale: avanza al prossimo giocatore
    const players = game.getPlayers();
    session.currentPlayerId = String(
      players[game.getTurn() % players.length].getId(),
    );
    session.pendingAction = null;
  }

  await saveSession(id, session);
  return NextResponse.json(toPublicSession(session));
}
