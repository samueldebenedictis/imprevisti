import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { FACES_ACCESS_COOKIE, FACES_COOKIE_PATH } from "@/lib/faces";
import { isFacesCodeFormat, normalizeFacesCode } from "@/lib/faces-codes";
import {
  FACES_ACCESS_TTL_SECONDS,
  getSession,
  grantFacesAccess,
  hasFacesAccess,
  isFacesGrantActive,
  redeemFacesCode,
} from "@/lib/session-store";

const NO_STORE = { "Cache-Control": "private, no-store" };

const deny = (error: string, status = 403) =>
  NextResponse.json({ granted: false, error }, { status, headers: NO_STORE });

/** Indica se questo dispositivo può vedere le fotografie FACES. */
export async function GET() {
  const token = (await cookies()).get(FACES_ACCESS_COOKIE)?.value;
  const granted = token ? await hasFacesAccess(token) : false;
  return NextResponse.json({ granted }, { headers: NO_STORE });
}

/** Permesso richiesto: con il codice dell'educatore o da una partita multigiocatore. */
async function findGrant(body: unknown): Promise<string | NextResponse> {
  const { code, sessionId } = (body ?? {}) as {
    code?: unknown;
    sessionId?: unknown;
  };

  if (typeof code === "string") {
    const normalized = normalizeFacesCode(code);
    if (!isFacesCodeFormat(normalized)) return deny("invalid-code");
    return (await redeemFacesCode(normalized)) ?? deny("invalid-code");
  }

  // Dispositivi dei giocatori: valgono il codice usato dall'host della partita
  if (typeof sessionId === "string") {
    const session = await getSession(sessionId);
    const grantId = session?.facesGrantId;
    if (!grantId || !(await isFacesGrantActive(grantId)))
      return deny("no-session-access");
    return grantId;
  }

  return deny("missing-code", 400);
}

/**
 * Disclaimer accettato: rilascia un token casuale legato al permesso della
 * partita, in un cookie httpOnly valido solo per le API.
 */
export async function POST(req: Request) {
  const grant = await findGrant(await req.json().catch(() => null));
  if (typeof grant !== "string") return grant;

  // Secure solo in https (Vercel): in locale via http, ad esempio dal telefono
  // sulla rete di casa, un cookie Secure verrebbe scartato dal browser
  const https =
    (req.headers.get("x-forwarded-proto") ?? new URL(req.url).protocol)
      .split(",")[0]
      .trim()
      .replace(/:$/, "") === "https";
  const token = crypto.randomUUID();
  await grantFacesAccess(token, grant);
  (await cookies()).set(FACES_ACCESS_COOKIE, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: https,
    path: FACES_COOKIE_PATH,
    maxAge: FACES_ACCESS_TTL_SECONDS,
  });
  return NextResponse.json({ granted: true }, { headers: NO_STORE });
}

/** Partita senza fotografie FACES: il dispositivo rinuncia all'accesso. */
export async function DELETE() {
  (await cookies()).delete({
    name: FACES_ACCESS_COOKIE,
    path: FACES_COOKIE_PATH,
  });
  return NextResponse.json({ granted: false }, { headers: NO_STORE });
}
