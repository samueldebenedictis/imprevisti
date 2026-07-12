export interface PlayersPanelProps {
  positions: Array<{ id: string; name: string; position: number }>;
  selfId: string | null;
}

export default function PlayersPanel({ positions, selfId }: PlayersPanelProps) {
  if (positions.length === 0) return null;
  const self = positions.find((p) => p.id === selfId);
  const others = positions.filter((p) => p.id !== selfId);
  const ordered = self ? [self, ...others] : positions;
  return (
    <div className="ui-border-dark mt-4 w-full max-w-sm bg-gray-100 p-4 text-left">
      <p className="ui-text-normal mb-2 font-semibold">Posizione giocatori</p>
      <ul className="ui-text-normal">
        {ordered.map((p) => (
          <li key={p.id} className={p.id === selfId ? "font-bold" : ""}>
            <span className={p.id === selfId ? "text-blue-500" : ""}>
              {p.name}
            </span>
            : {p.position}
          </li>
        ))}
      </ul>
    </div>
  );
}
