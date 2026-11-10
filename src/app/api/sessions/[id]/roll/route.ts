import { NextResponse } from "next/server";
import { toPendingAction } from "@/lib/pending-action";
import {
  getSession,
  saveSession,
  toPublicSession,
  withSessionLock,
} from "@/lib/session-store";
import { Game } from "@/model/game";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { playerId }: { playerId: string } = await req.json();

  // Il lock evita che un doppio tocco sul dado giochi due turni
  return withSessionLock(id, async () => {
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
    const actorPlayer = game
      .getPlayers()
      .find((p) => String(p.getId()) === playerId);
    const result = game.playTurn();

    session.gameState = game.toJSON();
    session.diceResult = result.diceResult;

    // Registra dove è atterrato il giocatore
    if (actorPlayer) {
      const newPos = game.getPlayerPosition(actorPlayer);
      const square = game.getBoard().getSquares()[newPos];
      session.lastMoveInfo = {
        actorPlayerId: playerId,
        diceResult: result.diceResult,
        squareNumber: square?.getNumber() ?? newPos,
        squareType: square?.getType() ?? "move",
        rolledAt: Date.now(),
      };
    }

    if (game.isGameEnded()) {
      session.gameOver = { winnerName: game.getWinner()?.getName() ?? "" };
      session.currentPlayerId = null;
      session.pendingAction = null;
    } else {
      // Battaglia o sfida: currentPlayerId resta invariato finché l'host
      // non registra l'esito
      session.pendingAction = toPendingAction(result, playerId);
      if (!session.pendingAction) {
        // Nessuna azione speciale: avanza al prossimo giocatore
        const players = game.getPlayers();
        session.currentPlayerId = String(
          players[game.getTurn() % players.length].getId(),
        );
      }
    }

    await saveSession(id, session);
    return NextResponse.json(toPublicSession(session));
  });
}
