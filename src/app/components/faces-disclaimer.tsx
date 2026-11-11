import type React from "react";
import { FACES_DISCLAIMER_EN, FACES_DISCLAIMER_IT } from "@/lib/faces";
import {
  FACES_DISCLAIMER_ACCEPT,
  FACES_DISCLAIMER_DECLINE,
  FACES_DISCLAIMER_ERROR,
} from "../texts";
import Button from "./ui/button";

interface FacesDisclaimerProps {
  title: string;
  /** Testo prima dell'impegno, ad esempio cosa succede se non si accetta. */
  intro?: string;
  error?: boolean;
  /** Riquadro grigio con bordo; false quando sta già dentro una finestra. */
  boxed?: boolean;
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
    {error && (
      <p className="ui-text-normal mt-2 text-red-600">
        {FACES_DISCLAIMER_ERROR}
      </p>
    )}
    <div className="flex justify-center">
      <Button onClick={onAccept} color="green">
        {FACES_DISCLAIMER_ACCEPT}
      </Button>
      <Button onClick={onDecline} color="red">
        {FACES_DISCLAIMER_DECLINE}
      </Button>
    </div>
  </div>
);

export default FacesDisclaimer;
