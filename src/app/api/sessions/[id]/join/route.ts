import { NextResponse } from "next/server";
import { getSession, saveSession } from "@/lib/session-store";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { playerName } = await req.json();

  const session = await getSession(id);
  if (!session)
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  if (session.started)
    return NextResponse.json(
      { error: "Game already started" },
      { status: 409 },
    );
  if (!playerName?.trim() || playerName.length > 50)
    return NextResponse.json({ error: "Nome non valido" }, { status: 400 });

  // ID numerico come stringa: Player(id: number) usa Number(p.id)
  const playerId = String(session.players.length);
  session.players.push({ id: playerId, name: playerName.trim() });
  await saveSession(id, session);

  return NextResponse.json({ playerId });
}
