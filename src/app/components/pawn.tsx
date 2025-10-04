"use client";

import { type Color, colorToCss } from "./ui/color";

type PawnProps = {
  name: string;
  color: Color;
  isCurrentPlayerTurn: boolean;
  isMoving?: boolean;
};

export default function Pawn(props: PawnProps) {
  const color = colorToCss(props.color);
  const bounceClass = props.isCurrentPlayerTurn ? "animate-bounce" : "";
  const movingClass =
    props.isMoving && props.isCurrentPlayerTurn ? "opacity-0" : "";
  const displayName =
    props.name.length > 14 ? props.name.substring(0, 14) : props.name;

  return (
    <div
      key={`pawn-${props.name}`}
      className={`ui-border-dark mb-1 text-center shadow-xl hover:opacity-50 ${color} ${bounceClass} ${movingClass}`}
    >
      <span className="ui-text-subtitle ui-text-light m-1">{displayName}</span>
    </div>
  );
}
