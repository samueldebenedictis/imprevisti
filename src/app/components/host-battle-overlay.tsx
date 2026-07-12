import Button from "./ui/button";

export interface HostBattleOverlayProps {
  players: { id: string; name: string }[];
  onResolve: (winnerId: string) => void;
  isResolving?: boolean;
}

export default function HostBattleOverlay({
  players,
  onResolve,
  isResolving = false,
}: HostBattleOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="ui-border-dark mx-4 flex w-full max-w-lg flex-col gap-6 bg-white p-8">
        <h2 className="ui-text-title text-center">Battaglia!</h2>
        <p className="ui-text-subtitle text-center">
          Carta, forbice, sasso — chi ha vinto?
        </p>
        <div className="flex">
          {players.map((p) => (
            <Button
              key={p.id}
              color="red"
              onClick={() => onResolve(p.id)}
              disabled={isResolving}
              className="mx-1 flex-1"
            >
              {p.name}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
