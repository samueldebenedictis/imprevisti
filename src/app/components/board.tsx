import type Square from "./square";

type BoardProps = {
  boardsize: number;
  squares: ReturnType<typeof Square>[];
};

export default function Board(props: BoardProps) {
  return (
    <div>
      {props.boardsize}
      <div className="grid grid-cols-3 grid-rows-3 h-full">
        {props.squares.map((component, _index) => {
          return (
            <div key={`square_${component.props.number}`} className="h-fit">
              {component}
            </div>
          );
        })}
      </div>
    </div>
  );
}
