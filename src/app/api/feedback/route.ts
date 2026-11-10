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

/** Campi con un punteggio da 1 a 5: SUS e valutazioni. */
const RATING_FIELDS = new Set<string>([
  ...Array.from({ length: 10 }, (_, i) => `sus${i + 1}`),
  "digitalVsPhysical",
  "gameplayClarity",
  "graphics",
  "enjoyment",
  "funLevel",
]);

/** Lunghezza massima dei campi di testo: oltre, il valore viene troncato. */
const MAX_TEXT_LENGTH = 2000;

/**
 * Tiene solo stringhe (troncate) e numeri finiti: scarta oggetti, array e simili.
 * Per i punteggi accetta solo interi da 1 a 5, così un valore fuori scala
 * non altera il calcolo del SUS.
 */
function sanitize(key: string, value: unknown): string | number | undefined {
  if (RATING_FIELDS.has(key))
    return typeof value === "number" &&
      Number.isInteger(value) &&
      value >= 1 &&
      value <= 5
      ? value
      : undefined;
  if (typeof value === "string") return value.slice(0, MAX_TEXT_LENGTH);
  if (typeof value === "number" && Number.isFinite(value)) return value;
  return undefined;
}

/** Data di oggi (AAAA-MM-GG) nel fuso italiano, non in UTC. */
function todayInRome(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Rome" }).format(
    new Date(),
  );
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const fields = body as Record<string, unknown>;

  const entry = {
    ...Object.fromEntries(
      ALLOWED_FIELDS.map((key) => [key, sanitize(key, fields[key])]).filter(
        ([, value]) => value !== undefined,
      ),
    ),
    // Solo la data, senza ora: l'orario esatto permetterebbe di risalire
    // a chi ha inviato la risposta.
    submittedAt: todayInRome(),
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
