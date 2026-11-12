import type { SquareJSON } from "@/model/square/square";
import { FACE_EMOTION_ENABLED } from "@/vars";
import { FACES_ACCESS_API } from "./faces";

/** Chiede al server se questo dispositivo ha già accettato il disclaimer FACES. */
export async function fetchFacesAccess(): Promise<boolean> {
  try {
    const res = await fetch(FACES_ACCESS_API, { cache: "no-store" });
    if (!res.ok) return false;
    const data: { granted?: boolean } = await res.json();
    return data.granted === true;
  } catch {
    return false;
  }
}

export type FacesAccessResult =
  | "granted"
  /** Codice inesistente, scaduto o già usato. */
  | "invalid-code"
  /** La partita multigiocatore non è stata avviata con un codice. */
  | "no-session-access"
  | "error";

/**
 * Registra l'accettazione del disclaimer FACES per questo dispositivo, con il
 * codice dell'educatore (avvio della partita) o con la partita multigiocatore
 * a cui il dispositivo partecipa.
 */
export async function acceptFacesAccess(
  access: { code: string } | { sessionId: string },
): Promise<FacesAccessResult> {
  try {
    const res = await fetch(FACES_ACCESS_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(access),
    });
    if (res.ok) return "granted";
    const { error } = (await res.json().catch(() => ({}))) as {
      error?: string;
    };
    return error === "invalid-code" || error === "no-session-access"
      ? error
      : "error";
  } catch {
    return "error";
  }
}

/** Partita senza fotografie FACES: toglie l'accesso a questo dispositivo. */
export async function revokeFacesAccess(): Promise<void> {
  try {
    await fetch(FACES_ACCESS_API, { method: "DELETE" });
  } catch {
    // Senza rete il cookie resta, ma la partita usa comunque i volti illustrati
  }
}

interface BoardChoice {
  numSquares: number;
  squareTypes: { "face-emotion": boolean };
  customSquares: SquareJSON[] | null;
}

/**
 * Indica se la partita che sta per iniziare conterrà la sfida
 * "Indovina l'emozione", e quindi fotografie FACES.
 */
export function configUsesFaceEmotion(config: BoardChoice): boolean {
  if (!FACE_EMOTION_ENABLED) return false;
  const usesCustomSquares =
    config.customSquares !== null &&
    config.customSquares.length === config.numSquares;
  if (usesCustomSquares)
    return (config.customSquares ?? []).some((s) => s.type === "face-emotion");
  return config.squareTypes["face-emotion"];
}
