import type React from "react";
import { useEffect, useState } from "react";
import { isFacesImageUrl } from "@/lib/faces";
import {
  acceptFacesAccess,
  fetchFacesAccess,
  loadSessionSecret,
} from "@/lib/faces-client";
import {
  FACES_DISCLAIMER_DECLINED,
  FACES_DISCLAIMER_ERROR,
  FACES_DISCLAIMER_SHOW_AGAIN,
  FACES_DISCLAIMER_TITLE,
  FACES_SESSION_NO_ACCESS,
} from "../texts";
import FacesDisclaimer from "./faces-disclaimer";
import Button from "./ui/button";

interface FacesAccessGateProps {
  /** URL della foto o della clip. */
  url: string;
  /**
   * Partita multigiocatore: il dispositivo ottiene l'accesso accettando il
   * disclaimer, se l'host ha avviato la partita con un codice FACES.
   */
  sessionId?: string;
  /** Contenuto da mostrare quando l'accesso c'è (la foto o la clip). */
  children: React.ReactNode;
}

type AccessState =
  | "checking"
  | "required"
  | "granted"
  | "declined"
  | "unavailable"
  | "error";

/**
 * Accesso al materiale FACES (fotografie e clip, URL /api/faces/...): si vede
 * solo in una partita avviata con il codice dell'educatore e dopo aver
 * accettato il disclaimer su questo dispositivo, come richiede il punto 4 del
 * FACES Platform Release Agreement. Il resto (volti illustrati, segnaposto)
 * è mostrato direttamente.
 */
const FacesAccessGate: React.FC<FacesAccessGateProps> = ({
  url,
  sessionId,
  children,
}) => {
  const gated = isFacesImageUrl(url);
  const [access, setAccess] = useState<AccessState>(
    gated ? "checking" : "granted",
  );

  useEffect(() => {
    if (!gated) return;
    let cancelled = false;
    fetchFacesAccess().then((granted) => {
      if (cancelled) return;
      // Su schermo singolo l'accesso si ottiene solo all'avvio, con il codice
      if (granted) setAccess("granted");
      else setAccess(sessionId ? "required" : "unavailable");
    });
    return () => {
      cancelled = true;
    };
  }, [gated, sessionId]);

  const accept = async () => {
    if (!sessionId) return;
    const result = await acceptFacesAccess({
      sessionId,
      secret: loadSessionSecret(sessionId),
    });
    if (result === "granted") setAccess("granted");
    else setAccess(result === "no-session-access" ? "unavailable" : "error");
  };

  if (access === "checking") return null;

  if (access === "granted") return <>{children}</>;

  if (access === "unavailable")
    return (
      <div className="ui-border-dark mx-auto max-w-sm bg-gray-100 p-4 text-center">
        <p className="ui-text-normal">{FACES_SESSION_NO_ACCESS}</p>
      </div>
    );

  if (access === "declined")
    return (
      <div className="ui-border-dark mx-auto max-w-sm bg-gray-100 p-4 text-center">
        <p className="ui-text-normal">{FACES_DISCLAIMER_DECLINED}</p>
        <Button
          onClick={() => setAccess("required")}
          color="black"
          className="mx-auto"
        >
          {FACES_DISCLAIMER_SHOW_AGAIN}
        </Button>
      </div>
    );

  return (
    <FacesDisclaimer
      title={FACES_DISCLAIMER_TITLE}
      error={access === "error" ? FACES_DISCLAIMER_ERROR : undefined}
      onAccept={accept}
      onDecline={() => setAccess("declined")}
    />
  );
};

export default FacesAccessGate;
