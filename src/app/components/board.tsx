"use client";

import type Square from "./square";

type BoardProps = {
  squares: ReturnType<typeof Square>[];
  cols?: 3 | 4 | 5;
};

const colsCss = (n: number | undefined) => {
  const base = `grid h-full`;
  switch (n) {
    case 5:
      return `${base} grid-cols-5`;
    case 4:
      return `${base} grid-cols-4`;
    default:
      return `${base} grid-cols-3`;
  }
};

export default function Board(props: BoardProps) {
  return (
    <div key="board">
      <span className="testo-nero m-auto">
        Tabellone con {props.squares.length} caselle!
      </span>
      <div className={colsCss(props.cols)}>
        {props.squares.map((component, index) => {
          return (
            <div
              key={`board-square-${component.props.number || index}`}
              className="h-fit p-1"
            >
              {component}
            </div>
          );
        })}
      </div>
    </div>
  );
}
