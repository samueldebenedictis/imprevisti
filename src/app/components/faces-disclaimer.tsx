import type React from "react";
import { FACES_DISCLAIMER_EN, FACES_DISCLAIMER_IT } from "@/lib/faces";
import { FACES_DISCLAIMER_ACCEPT, FACES_DISCLAIMER_DECLINE } from "../texts";
import Button from "./ui/button";

interface FacesDisclaimerProps {
  title: string;
  /** Testo prima dell'impegno, ad esempio cosa succede se non si accetta. */
  intro?: string;
  /** Messaggio d'errore, ad esempio codice non valido. */
  error?: string;
  /** Riquadro grigio con bordo; false quando sta già dentro una finestra. */
  boxed?: boolean;
  acceptLabel?: string;
  declineLabel?: string;
  /** Contenuto tra l'impegno e i pulsanti, ad esempio il campo del codice. */
  children?: React.ReactNode;
  onAccept: () => void;
  onDecline: () => void;
}

/**
 * Disclaimer delle fotografie FACES (punto 4 del FACES Platform Release
 * Agreement): l'impegno a non diffondere le immagini, da accettare prima di
 * vederle. Usato all'avvio della partita e al primo volto su ogni dispositivo.
 */
const FacesDisclaimer: React.FC<FacesDisclaimerProps> = ({
  title,
  intro,
  error,
  boxed = true,
  acceptLabel = FACES_DISCLAIMER_ACCEPT,
  declineLabel = FACES_DISCLAIMER_DECLINE,
  children,
  onAccept,
  onDecline,
}) => (
  <div
    className={`mx-auto max-w-sm text-center ${boxed ? "ui-border-dark bg-gray-100 p-4" : ""}`}
  >
    <p className="ui-text-subtitle mb-2">{title}</p>
    {intro && <p className="ui-text-normal mb-2">{intro}</p>}
    <p className="ui-text-normal mb-2">{FACES_DISCLAIMER_IT}</p>
    <p className="text-gray-600 text-sm italic" lang="en">
      {FACES_DISCLAIMER_EN}
    </p>
    {children}
    {error && (
      <p className="ui-text-normal mt-2 text-red-600" role="alert">
        {error}
      </p>
    )}
    <div className="flex justify-center">
      <Button onClick={onAccept} color="green">
        {acceptLabel}
      </Button>
      <Button onClick={onDecline} color="red">
        {declineLabel}
      </Button>
    </div>
  </div>
);

export default FacesDisclaimer;
