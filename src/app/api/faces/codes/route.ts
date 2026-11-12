import { NextResponse } from "next/server";
import { generateFacesCode, isFacesCodesSecret } from "@/lib/faces-codes";
import { FACES_CODE_TTL, saveFacesCode } from "@/lib/session-store";

const NO_STORE = { "Cache-Control": "private, no-store" };

/**
 * Genera un codice monouso per una partita con le fotografie FACES.
 * Riservato agli educatori: serve il segreto FACES_CODES_SECRET.
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!isFacesCodesSecret(body?.secret))
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401, headers: NO_STORE },
    );

  const code = generateFacesCode();
  await saveFacesCode(code);
  return NextResponse.json(
    { code, expiresAt: Date.now() + FACES_CODE_TTL * 1000 },
    { headers: NO_STORE },
  );
}
