"use client";

import Pawn from "./pawn";
import { type Color, colorToCss } from "./ui/color";

type SquareType = "normal" | "mime" | "quiz" | "move-forward" | "move-back";

type SquareProps = {
  number: number;
  squareType: SquareType;
  playersOn?: string[];
  boardSize?: number;
};

const typeToColor = (type: SquareType): Color => {
  switch (type) {
    case "mime":
      return "purple";
    case "quiz":
      return "yellow";
    case "move-forward":
      return "green";
    case "move-back":
      return "red";
    case "normal":
      return "blue";
    default:
      return "black";
  }
};

const text = (n: number, boardSize?: number) => {
  const classBase = "testo-bianco m-auto";
  if (n === 0) {
    return <span className={`${classBase} testo-titolo`}>START</span>;
  } else if (n + 1 === boardSize) {
    return <span className={`${classBase} testo-titolo`}>WIN!</span>;
  } else {
    return <span className={`${classBase} testo-titolo text-7xl`}>{n}</span>;
  }
};

const playersOn = (names: string[] | undefined) => {
  if (names) return names.map((el) => Pawn({ name: el, color: "yellow" }));
};

const background = (number: number) => {
  return `square-background-${number % 13}`;
};

export default function Square(props: SquareProps) {
  const typeColor = typeToColor(props.squareType);
  const color = colorToCss(
    props.number === 0 || props.number + 1 === props.boardSize
      ? "black"
      : typeColor,
  );
  const bg = background(props.number);
  return (
    <div className="relative border-4 border-gray-800 shadow-xl">
      <div className={`h-32 w-32 ${color}`}>
        <div className={`h-full ${bg}`}></div>
      </div>
      <div className="absolute top-0 flex h-full w-full text-center">
        {text(props.number, props.boardSize)}
      </div>
      <div className="absolute bottom-0 w-full pr-1 pl-1">
        {playersOn(props.playersOn)}
      </div>
    </div>
  );
}
