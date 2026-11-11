import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { FACES_ACCESS_COOKIE } from "@/lib/faces";
import {
  FACES_ACCESS_TTL_SECONDS,
  grantFacesAccess,
  hasFacesAccess,
} from "@/lib/session-store";

const NO_STORE = { "Cache-Control": "private, no-store" };

/** Indica se questo dispositivo ha già accettato il disclaimer FACES. */
export async function GET() {
  const token = (await cookies()).get(FACES_ACCESS_COOKIE)?.value;
  const granted = token ? await hasFacesAccess(token) : false;
  return NextResponse.json({ granted }, { headers: NO_STORE });
}

/**
 * Registra l'accettazione del disclaimer: rilascia un token casuale, salvato
 * sul server con la stessa scadenza di una partita, in un cookie httpOnly
 * valido solo per /api/faces.
 */
export async function POST() {
  const token = crypto.randomUUID();
  await grantFacesAccess(token);
  (await cookies()).set(FACES_ACCESS_COOKIE, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/api/faces",
    maxAge: FACES_ACCESS_TTL_SECONDS,
  });
  return NextResponse.json({ granted: true }, { headers: NO_STORE });
}
