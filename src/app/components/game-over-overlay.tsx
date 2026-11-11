import Link from "next/link";
import { URL_FEEDBACK, URL_HOME } from "@/vars";
import Button from "./ui/button";

type GameOverOverlayProps = {
  winnerName: string;
  /** Testo del pulsante che riporta alla home */
  homeLabel?: string;
};

/**
 * Overlay di fine partita sul tabellone, usato a schermo singolo e
 * sull'host del multi-dispositivo.
 */
export default function GameOverOverlay({
  winnerName,
  homeLabel = "Torna alla home",
}: GameOverOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="ui-border-dark mx-4 flex w-full max-w-sm flex-col gap-6 bg-white p-8 text-center">
        <h2 className="ui-text-title">Fine partita!</h2>
        <p className="ui-text-subtitle">
          Vince: <strong>{winnerName}</strong>
        </p>
        <Link href={URL_FEEDBACK} className="block">
          <Button color="green" className="mx-0 w-full">
            Dai un feedback!
          </Button>
        </Link>
        <Link href={URL_HOME} className="block">
          <Button color="blue" className="mx-0 w-full">
            {homeLabel}
          </Button>
        </Link>
      </div>
    </div>
  );
}
