import { NextResponse } from "next/server";
import { getFeedback, pushFeedback } from "@/lib/session-store";

/**
 * Campi accettati dal modulo di feedback: tutto il resto viene scartato,
 * così che nello store finiscano solo i dati previsti (minimizzazione).
 */
const ALLOWED_FIELDS = [
  "ageGroup",
  "gameExperience",
  "screenMode",
  "autismIdentification",
  "appVersion",
  "digitalVsPhysical",
  "gameplayClarity",
  "graphics",
  "enjoyment",
  "funLevel",
  ...Array.from({ length: 10 }, (_, i) => `sus${i + 1}`),
  "whatWorkedWell",
  "challenges",
  "suggestions",
] as const;

export async function POST(req: Request) {
  const body = await req.json();

  const entry = {
    ...Object.fromEntries(
      ALLOWED_FIELDS.filter((key) => key in body).map((key) => [
        key,
        body[key],
      ]),
    ),
    // Solo la data, senza ora: l'orario esatto permetterebbe di risalire
    // a chi ha inviato la risposta.
    submittedAt: new Date().toISOString().slice(0, 10),
    id: crypto.randomUUID(),
  };

  await pushFeedback(JSON.stringify(entry));
  return NextResponse.json({ ok: true });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get("secret") !== process.env.FEEDBACK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const items = await getFeedback(100);
  return NextResponse.json(
    items.map((i) => (typeof i === "string" ? JSON.parse(i) : i)),
  );
}
