type BarChartItem = {
  label: string;
  value: number;
};

type BarChartProps = {
  items: BarChartItem[];
  max: number;
  valueFormatter?: (value: number) => string;
};

// Serie unica (una metrica confrontata tra categorie): stessa tinta blu per
// ogni barra, l'etichetta sull'asse porta già l'identità della categoria.
const BAR_COLOR = "#2a78d6";

export default function BarChart({
  items,
  max,
  valueFormatter,
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

        return (
          <div key={item.label} className="flex items-center gap-3">
            <span className="w-52 shrink-0 truncate text-gray-600 text-sm">
              {item.label}
            </span>
            <div
              className="relative h-3 flex-1 rounded-full bg-gray-200"
              title={`${item.label}: ${displayValue}`}
            >
              <div
                className="h-3 rounded-full transition-all"
                style={{ width: `${pct}%`, backgroundColor: BAR_COLOR }}
              />
            </div>
            <span className="w-12 shrink-0 text-right font-medium text-gray-800 text-sm">
              {displayValue}
            </span>
          </div>
        );
      })}
    </div>
  );
}
