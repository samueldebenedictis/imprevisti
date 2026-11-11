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

/** Registra l'accettazione del disclaimer FACES per questo dispositivo. */
export async function acceptFacesAccess(): Promise<boolean> {
  try {
    const res = await fetch(FACES_ACCESS_API, { method: "POST" });
    return res.ok;
  } catch {
    return false;
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
