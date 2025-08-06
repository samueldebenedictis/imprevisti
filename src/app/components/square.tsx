"use client";
import { type Color, colorToCss } from "./color";
import Pawn from "./pawn";

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
  const classBase = "text-gray-100 font-extrabold font-londrina-solid m-auto";
  if (n === 0) {
    return <span className={`${classBase} text-5xl`}>START</span>;
  } else if (n + 1 === boardSize) {
    return <span className={`${classBase} text-5xl`}>WIN!</span>;
  } else {
    return <span className={`${classBase} text-7xl`}>{n}</span>;
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
      <div className="absolute text-center top-0 w-full h-full flex">
        {text(props.number, props.boardSize)}
      </div>
      <div className="absolute w-full pl-1 pr-1 bottom-0">
        {playersOn(props.playersOn)}
      </div>
    </div>
  );
}
