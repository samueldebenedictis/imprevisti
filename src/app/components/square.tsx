import Pawn from "./pawn";

type Color = "yellow" | "blue" | "green" | "red" | "purple" | "black";

type SquareType = "normal" | "mime" | "quiz" | "move-forward" | "move-back";

type SquareProps = {
  number: number;
  squareType: SquareType;
  playersOn?: string[];
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
    case "purple":
      return `bg-linear-to-br from-purple-600 to-purple-400 text-red-500`;
    default:
      return "bg-linear-to-br from-gray-600 to-gray-400 text-gray-800";
  }
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

const number = (n: number) => {
  const classBase = "text-gray-100 font-extrabold font-londrina-solid m-auto";
  if (n === 0) {
    return <span className={`${classBase} text-5xl`}>START</span>;
  } else {
    return <span className={`${classBase} text-7xl`}>{n}</span>;
  }
};

const playersOn = (names: string[] | undefined) => {
  if (names) return names.map((el) => Pawn({ name: el, color: "yellow" }));
};

export default function Square(props: SquareProps) {
  const typeColor = typeToColor(props.squareType);
  const color = colorToCss(props.number === 0 ? "black" : typeColor);

  return (
    <div className="relative border-4 border-gray-800 shadow-xl">
      <div className={`h-32 w-32 ${color}`}>
        <div className={`h-full square-background-${props.number}`}></div>
      </div>
      <div className="absolute text-center top-0 w-full h-full flex">
        {number(props.number)}
      </div>
      <div className="absolute w-full bottom-0 m-auto">
        <div className="text-center">{playersOn(props.playersOn)}</div>
      </div>
    </div>
  );
}
