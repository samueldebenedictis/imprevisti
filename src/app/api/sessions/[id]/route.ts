import { NextResponse } from "next/server";
import { getSession, toPublicSession } from "@/lib/session-store";

// Long polling: la richiesta resta aperta fino a 8 s e controlla lo store
// una volta al secondo (circa 8 letture Redis per richiesta senza novità)
const LONG_POLL_TIMEOUT_MS = 8000;
const STORE_CHECK_MS = 1000;

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const since = new URL(req.url).searchParams.get("since");

  if (since) {
    const deadline = Date.now() + LONG_POLL_TIMEOUT_MS;
    while (Date.now() < deadline) {
      const session = await getSession(id);
      if (!session)
        return NextResponse.json(
          { error: "Session not found" },
          { status: 404 },
        );
      if (String(session.updatedAt) !== since)
        return NextResponse.json(toPublicSession(session));
      await new Promise((r) => setTimeout(r, STORE_CHECK_MS));
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
