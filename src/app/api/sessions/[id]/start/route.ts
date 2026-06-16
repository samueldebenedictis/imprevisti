import { NextResponse } from "next/server";
import { generateSquares } from "@/app/utils/generate-squares";
import { getSession, saveSession } from "@/lib/session-store";
import { Board } from "@/model/board";
import { Game } from "@/model/game";
import { Player } from "@/model/player";
import type { GameConfig } from "@/store/config-store";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const {
    hostToken,
    boardConfig,
  }: { hostToken: string; boardConfig: GameConfig } = await req.json();

  const session = await getSession(id);
  if (!session)
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  if (session.hostToken !== hostToken)
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  if (session.players.length < 2)
    return NextResponse.json({ error: "Min 2 players" }, { status: 400 });
  if (session.started)
    return NextResponse.json({ error: "Already started" }, { status: 409 });

  // Player(id: number, name: string) — id è l'indice numerico
  const players = session.players.map((p) => new Player(Number(p.id), p.name));

  // Replica di config-store.ts:createGame()
  const squaresJSON =
    boardConfig.customSquares?.length === boardConfig.numSquares
      ? boardConfig.customSquares
      : generateSquares(
          boardConfig.numSquares,
          boardConfig.squareTypes,
          boardConfig.specialPercentage / 100,
        );

  const board = Board.fromJSON(
    {
      playersPosition: players.map((p) => ({
        playerId: p.getId(),
        position: 0,
      })),
      squares: squaresJSON,
    },
    players,
  );

  const game = new Game(board);

  session.started = true;
  session.gameState = game.toJSON();
  session.currentPlayerId = String(game.getPlayers()[0].getId());

  await saveSession(id, session);
  return NextResponse.json({ ok: true });
}
