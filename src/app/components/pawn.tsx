"use client";

import { type Color, colorToCss } from "./ui/color";

type PawnProps = {
  name: string;
  color: Color;
  isCurrentPlayerTurn: boolean;
};

export default function Pawn(props: PawnProps) {
  const color = colorToCss(props.color);
  const bounceClass = props.isCurrentPlayerTurn ? "animate-bounce" : "";
  return (
    <div
      key={`pawn-${props.name}`}
      className={`ui-border-dark mb-1 text-center shadow-xl ${color} ${bounceClass}`}
    >
      <span className="ui-text-normal ui-text-light m-1">{props.name}</span>
    </div>
  );
}
