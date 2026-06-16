import type { IdleState } from "@/lib/use-session-polling";
import Button from "./ui/button";

export function IdleOverlay({
  idleState,
  onResume,
}: {
  idleState: IdleState;
  onResume: () => void;
}) {
  if (idleState === "active") return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="ui-border-dark mx-4 flex w-full max-w-sm flex-col gap-6 bg-white p-8 text-center">
        {idleState === "idle" ? (
          <>
            <p className="ui-text-title">Stai ancora giocando?</p>
            <p className="ui-text-normal text-gray-500">
              Il polling è stato sospeso per inattività.
            </p>
            <Button color="green" onClick={onResume} className="mx-0">
              Sì, continua
            </Button>
          </>
        ) : (
          <>
            <p className="ui-text-title">Polling sospeso</p>
            <p className="ui-text-normal text-gray-500">
              Tocca lo schermo per riprendere.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
