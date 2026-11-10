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

// Campi obbligatori del modulo: senza questi la risposta non è utilizzabile
const REQUIRED_TEXT_FIELDS = ["ageGroup", "gameExperience", "screenMode"];
const REQUIRED_RATING_FIELDS = [
  ...Array.from({ length: 10 }, (_, i) => `sus${i + 1}`),
  "gameplayClarity",
  "graphics",
  "enjoyment",
  "funLevel",
];

const isRating = (value: unknown) =>
  typeof value === "number" &&
  Number.isInteger(value) &&
  value >= 1 &&
  value <= 5;

/** Restituisce il motivo del rifiuto, oppure null se i campi sono validi. */
function validate(fields: Record<string, unknown>): string | null {
  for (const key of ALLOWED_FIELDS) {
    const value = fields[key];
    if (value === undefined) continue;
    if (RATING_FIELDS.has(key)) {
      if (!isRating(value)) return `${key} deve essere un intero da 1 a 5`;
    } else if (typeof value !== "string") {
      return `${key} deve essere un testo`;
    }
  }
  for (const key of REQUIRED_TEXT_FIELDS) {
    const value = fields[key];
    if (typeof value !== "string" || !value.trim())
      return `${key} è obbligatorio`;
  }
  for (const key of REQUIRED_RATING_FIELDS) {
    if (fields[key] === undefined) return `${key} è obbligatorio`;
  }
  return null;
}

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
  const error = validate(fields);
  if (error) return NextResponse.json({ error }, { status: 400 });

  // Solo i campi previsti; i testi sono troncati a MAX_TEXT_LENGTH
  const entry = {
    ...Object.fromEntries(
      ALLOWED_FIELDS.filter((key) => fields[key] !== undefined).map((key) => {
        const value = fields[key];
        return [
          key,
          typeof value === "string" ? value.slice(0, MAX_TEXT_LENGTH) : value,
        ];
      }),
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
