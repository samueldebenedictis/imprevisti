"use client";

import type { PawnShape } from "@/model/pawn";
import { type Color, colorToCss } from "./ui/color";

type PawnProps = {
  name: string;
  color: Color;
  /** Forma della pedina; senza, il rettangolo classico. */
  shape?: PawnShape;
  isCurrentPlayerTurn: boolean;
};

// Esagono e parallelogramma: poligoni (in percentuale) usati sia per ritagliare
// lo sfondo sia per disegnarne il bordo
const POLYGONS: Partial<Record<PawnShape, string>> = {
  hexagon: "10,0 90,0 100,50 90,100 10,100 0,50",
  parallelogram: "12,0 100,0 88,100 0,100",
};

const clipPath = (points: string) =>
  `polygon(${points
    .split(" ")
    .map((point) => {
      const [x, y] = point.split(",");
      return `${x}% ${y}%`;
    })
    .join(", ")})`;

const CSS_SHAPES: Partial<Record<PawnShape, string>> = {
  square: "",
  rounded: "rounded-lg",
  pill: "rounded-full",
};

export default function Pawn(props: PawnProps) {
  const shape = props.shape ?? "square";
  const color = colorToCss(props.color);
  const bounceClass = props.isCurrentPlayerTurn ? "animate-bounce" : "";
  const displayName =
    props.name.length > 14 ? props.name.substring(0, 14) : props.name;
  const label = (
    <span className="ui-text-subtitle ui-text-light m-1">{displayName}</span>
  );

  const points = POLYGONS[shape];
  if (points) {
    // Lo sfondo è ritagliato con clip-path, che taglierebbe anche un bordo CSS:
    // il bordo è un poligono SVG con tratto doppio, di cui resta visibile la
    // metà interna (come border-4)
    return (
      <div
        data-shape={shape}
        className={`mb-1 drop-shadow-xl hover:opacity-50 ${bounceClass}`}
      >
        <div
          // py-1: stessi 4px del border-4 delle altre forme, così l'altezza
          // della pedina non cambia con la forma
          className={`relative px-3 py-1 text-center ${color}`}
          style={{ clipPath: clipPath(points) }}
        >
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <polygon
              points={points}
              fill="none"
              className="stroke-gray-800"
              strokeWidth={8}
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          {label}
        </div>
      </div>
    );
  }

  return (
    <div
      data-shape={shape}
      className={`ui-border-dark mb-1 text-center shadow-xl hover:opacity-50 ${CSS_SHAPES[shape] ?? ""} ${color} ${bounceClass}`}
    >
      {label}
    </div>
  );
}
