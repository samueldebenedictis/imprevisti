export type BarChartItem = {
  label: string;
  value: number;
  // Valore grezzo della categoria (es. "alunno"): presente solo se la barra
  // deve essere cliccabile per filtrare la dashboard.
  key?: string;
};

type BarChartProps = {
  items: BarChartItem[];
  max: number;
  valueFormatter?: (value: number) => string;
  selectedKeys?: Set<string>;
  onItemClick?: (key: string) => void;
};

// Serie unica (una metrica confrontata tra categorie): stessa tinta blu per
// ogni barra, l'etichetta sull'asse porta già l'identità della categoria.
const BAR_COLOR = "#2a78d6";
// Step 600 della stessa rampa sequenziale blu (palette.md) per lo stato "selezionato".
const BAR_COLOR_SELECTED = "#184f95";

export default function BarChart({
  items,
  max,
  valueFormatter,
  selectedKeys,
  onItemClick,
}: BarChartProps) {
  if (items.length === 0) {
    return <p className="text-gray-600 text-sm">Nessun dato disponibile.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => {
        const pct = max > 0 ? Math.min(100, (item.value / max) * 100) : 0;
        const displayValue = valueFormatter
          ? valueFormatter(item.value)
          : String(item.value);
        const clickable = Boolean(onItemClick && item.key);
        const selected = Boolean(item.key && selectedKeys?.has(item.key));

        const rowContent = (
          <>
            <span
              className={`w-52 shrink-0 truncate text-sm ${selected ? "font-semibold text-sky-800" : "text-gray-600"}`}
            >
              {item.label}
            </span>
            <div
              className={`relative h-3 flex-1 rounded-full bg-gray-200 ${selected ? "ring-2 ring-sky-700 ring-offset-1" : ""}`}
              title={`${item.label}: ${displayValue}`}
            >
              <div
                className="h-3 rounded-full transition-all"
                style={{
                  width: `${pct}%`,
                  backgroundColor: selected ? BAR_COLOR_SELECTED : BAR_COLOR,
                }}
              />
            </div>
            <span className="w-12 shrink-0 text-right font-medium text-gray-800 text-sm">
              {displayValue}
            </span>
          </>
        );

        if (!clickable) {
          return (
            <div key={item.label} className="flex items-center gap-3">
              {rowContent}
            </div>
          );
        }

        return (
          <button
            key={item.label}
            type="button"
            onClick={() => onItemClick?.(item.key as string)}
            className="flex w-full cursor-pointer items-center gap-3 border-none bg-transparent p-0 text-left"
          >
            {rowContent}
          </button>
        );
      })}
    </div>
  );
}
