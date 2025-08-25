"use client";

import { type Color, colorToCss } from "./color";

type PawnProps = {
  name: string;
  color: Color;
};

export default function Pawn(props: PawnProps) {
  const color = colorToCss(props.color);
  return (
    <div
      key={`pawn-${props.name}`}
      className={`mb-1 border-4 border-gray-800 text-center shadow-xl ${color}`}
    >
      <span className="m-1 font-extrabold font-londrina-solid text-gray-100 text-xl">
        {props.name}
      </span>
    </div>
  );
}
