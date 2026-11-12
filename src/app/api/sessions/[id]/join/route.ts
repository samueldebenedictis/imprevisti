import { NextResponse } from "next/server";
import { getSession, saveSession, withSessionLock } from "@/lib/session-store";
import { MAX_PLAYERS } from "@/vars";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { playerName } = await req.json();

  if (
    typeof playerName !== "string" ||
    !playerName.trim() ||
    playerName.length > 50
  )
    return NextResponse.json({ error: "Nome non valido" }, { status: 400 });

  return withSessionLock(id, async () => {
    const session = await getSession(id);
    if (!session)
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    if (session.started)
      return NextResponse.json(
        { error: "Game already started" },
        { status: 409 },
      );
    if (session.players.length >= MAX_PLAYERS)
      return NextResponse.json({ error: "Sessione piena" }, { status: 409 });

    // ID numerico come stringa: Player(id: number) usa Number(p.id)
    const playerId = String(session.players.length);
    session.players.push({ id: playerId, name: playerName.trim() });
    // Segreto del giocatore: serve al telefono per l'accesso alle foto FACES
    const playerSecret = crypto.randomUUID();
    session.playerSecrets = [...(session.playerSecrets ?? []), playerSecret];
    await saveSession(id, session);

    return NextResponse.json({ playerId, playerSecret });
  });
}
