import { buildings } from "./building";

type Color =
  | "yellow"
  | "blue"
  | "green"
  | "red"
  | "black"
  | "purple"
  | "orange"
  | "cyan";

type SquareType = "normal" | "mime" | "quiz" | "move";

type SquareProps = {
  number: number;
  buildingIndex: keyof typeof buildings;
  squareType?: SquareType;
  color?: Color;
};

const borderColor = (color: Color) => {
  switch (color) {
    case "yellow":
      return `bg-amber-500 text-amber-500`;
    case "blue":
      return `bg-sky-500 text-blue-500`;
    case "green":
      return `bg-green-500 text-green-500`;
    case "red":
      return `bg-red-500 text-red-500`;
    default:
      return "bg-gray-800 text-gray-800";
  }
};

const _insideColor = (color: Color) => {
  const base = "bg-linear-to-t to-white";
  switch (color) {
    case "yellow":
      return `${base} from-amber-50`;
    case "blue":
      return `${base} from-sky-50`;
    case "green":
      return `${base} from-green-50 `;
    case "red":
      return `${base} from-red-50`;
    case "purple":
      return `${base} from-purple-50`;
    case "orange":
      return `${base} from-orange-50`;
    case "cyan":
      return `${base} from-cyan-50`;
    default:
      return `${base} from-gray-50`;
  }
};

const getSquareTypeColor = (type: SquareType): Color => {
  switch (type) {
    case "mime":
      return "red";
    case "quiz":
      return "red";
    case "move":
      return "cyan";
    default:
      return "black"; // Default for "normal" or unknown types
  }
};

export default function Square(props: SquareProps) {
  const _image = buildings[props.buildingIndex];
  const typeColor = props.squareType
    ? getSquareTypeColor(props.squareType)
    : undefined;
  console.log(typeColor);
  const _displayColor = typeColor;

  const color = borderColor(props.color || "black");
  return (
    <div className="relative border-4 border-black">
      <div className={`h-32 w-32 ${color}`}>
        <div className={`h-full square-background-${props.number}`}></div>
      </div>
      <div className="absolute text-center top-0 w-full h-full flex">
        <span className="text-black font-extrabold text-7xl font-londrina m-auto">
          {props.number}
        </span>
      </div>
    </div>
  );
}
