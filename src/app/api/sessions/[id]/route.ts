import { NextResponse } from "next/server";
import { getSession, toPublicSession } from "@/lib/session-store";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const since = new URL(req.url).searchParams.get("since");

  if (since) {
    const deadline = Date.now() + 8000;
    while (Date.now() < deadline) {
      const session = await getSession(id);
      if (!session)
        return NextResponse.json(
          { error: "Session not found" },
          { status: 404 },
        );
      if (String(session.updatedAt) !== since)
        return NextResponse.json(toPublicSession(session));
      await new Promise((r) => setTimeout(r, 300));
    }
    // Timeout — restituisce stato attuale invariato
    const session = await getSession(id);
    if (!session)
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    return NextResponse.json(toPublicSession(session));
  }

  const session = await getSession(id);
  if (!session)
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  return NextResponse.json(toPublicSession(session));
}
