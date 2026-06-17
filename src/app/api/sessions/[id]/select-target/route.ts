import { NextResponse } from "next/server";
import { getSession, saveSession, toPublicSession } from "@/lib/session-store";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { playerId, targetId }: { playerId: string; targetId: string } =
    await req.json();

  const session = await getSession(id);
  if (!session?.pendingAction)
    return NextResponse.json({ error: "No pending action" }, { status: 409 });
  if (session.pendingAction.actorPlayerId !== playerId)
    return NextResponse.json({ error: "Not your action" }, { status: 403 });
  if (session.pendingAction.targetPlayerId)
    return NextResponse.json({ error: "Target already set" }, { status: 409 });
  if (targetId === playerId)
    return NextResponse.json(
      { error: "Cannot target yourself" },
      { status: 400 },
    );
  if (!session.players.some((p) => p.id === targetId))
    return NextResponse.json(
      { error: "Giocatore non trovato" },
      { status: 400 },
    );

  session.pendingAction.targetPlayerId = targetId;
  await saveSession(id, session);
  return NextResponse.json(toPublicSession(session));
}
