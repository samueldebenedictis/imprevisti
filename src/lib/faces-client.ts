import type { SquareJSON } from "@/model/square/square";
import { EMOTION_VIDEO_ENABLED, FACE_EMOTION_ENABLED } from "@/vars";
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

export type FacesAccessRequest =
  /** Codice dell'educatore, per una partita a schermo singolo o multigiocatore. */
  | { code: string; mode: "single" | "multi" }
  /** Partita multigiocatore, con il segreto dell'host o del giocatore. */
  | { sessionId: string; secret: string | null };

const playerSecretKey = (sessionId: string) => `playerSecret:${sessionId}`;

/** Salva il segreto ricevuto entrando in una partita come giocatore. */
export function savePlayerSecret(sessionId: string, secret: string): void {
  try {
    localStorage.setItem(playerSecretKey(sessionId), secret);
  } catch {
    // Senza storage il telefono non potrà vedere le foto FACES
  }
}

/**
 * Segreto con cui questo dispositivo partecipa alla partita: quello del
 * giocatore, oppure il token dell'host (tabellone).
 */
export function loadSessionSecret(sessionId: string): string | null {
  try {
    return (
      localStorage.getItem(playerSecretKey(sessionId)) ??
      localStorage.getItem("hostToken")
    );
  } catch {
    return null;
  }
}

/**
 * Registra l'accettazione del disclaimer FACES per questo dispositivo, con il
 * codice dell'educatore (avvio della partita) o con la partita multigiocatore
 * a cui il dispositivo partecipa.
 */
export async function acceptFacesAccess(
  access: FacesAccessRequest,
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
  squareTypes: { "face-emotion": boolean; "emotion-video": boolean };
  customSquares: SquareJSON[] | null;
}

/**
 * Indica se la partita che sta per iniziare può mostrare materiale FACES:
 * "Indovina l'emozione" (fotografie) o "Emozioni in movimento" (clip).
 * In quel caso all'avvio si chiede il codice dell'educatore.
 */
export function configUsesFaceEmotion(config: BoardChoice): boolean {
  const enabled = new Set<string>();
  if (FACE_EMOTION_ENABLED) enabled.add("face-emotion");
  if (EMOTION_VIDEO_ENABLED) enabled.add("emotion-video");
  const usesCustomSquares =
    config.customSquares !== null &&
    config.customSquares.length === config.numSquares;
  if (usesCustomSquares)
    return (config.customSquares ?? []).some((s) => enabled.has(s.type));
  return [...enabled].some(
    (type) => config.squareTypes[type as keyof BoardChoice["squareTypes"]],
  );
}
