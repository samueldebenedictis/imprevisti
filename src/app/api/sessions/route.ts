import { NextResponse } from "next/server";
import { v4 as uuid } from "uuid";
import { saveSession } from "@/lib/session-store";
import type { SessionState } from "@/types/session";

export async function POST() {
  const sessionId = uuid().slice(0, 6).toUpperCase();
  const hostToken = uuid();

  const state: SessionState = {
    sessionId,
    hostToken,
    players: [],
    started: false,
    gameState: null,
    currentPlayerId: null,
    pendingAction: null,
    diceResult: null,
    lastMoveInfo: null,
    gameOver: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  await saveSession(sessionId, state);

  return NextResponse.json({ sessionId, hostToken });
}
