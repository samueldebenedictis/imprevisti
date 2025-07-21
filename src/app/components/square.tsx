type Color = "yellow" | "blue" | "green" | "red";

type SquareType = "normal" | "mime" | "quiz" | "move";

type SquareProps = {
  number: number;
  squareType: SquareType;
};

const colorToCss = (color: Color) => {
  switch (color) {
    case "yellow":
      return `bg-linear-to-br from-amber-600 to-amber-400 text-amber-500`;
    case "blue":
      return `bg-linear-to-br from-sky-600 to-sky-400 text-blue-500`;
    case "green":
      return `bg-linear-to-br from-green-600 to-green-400 text-green-500`;
    case "red":
      return `bg-linear-to-br from-red-600 to-red-400 text-red-500`;
    default:
      return "bg-linear-to-br from-gray-600 to-gray-400 text-gray-800";
  }
};

const typeToColor = (type: SquareType): Color => {
  switch (type) {
    case "mime":
      return "red";
    case "quiz":
      return "yellow";
    case "move":
      return "green";
    default:
      return "blue";
  }
};

const number = (n: number) => {
  if (n === 0) {
    return (
      <span className="text-gray-100 font-extrabold text-5xl font-londrina-solid m-auto">
        START
      </span>
    );
  } else {
    return (
      <span className="text-gray-100 font-extrabold text-7xl font-londrina-solid m-auto">
        {n}
      </span>
    );
  }
};

export default function Square(props: SquareProps) {
  const typeColor = typeToColor(props.squareType);
  const color = colorToCss(typeColor);

  return (
    <div className="relative border-4 border-gray-800 shadow-xl">
      <div className={`h-32 w-32 ${color}`}>
        <div className={`h-full square-background-${props.number}`}></div>
      </div>
      <div className="absolute text-center top-0 w-full h-full flex">
        {number(props.number)}
      </div>
    </div>
  );
}
