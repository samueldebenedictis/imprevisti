import Image from "next/image";
import { buildings } from "./building";

type Color = "yellow" | "blue" | "green" | "red" | "black";

type SquareProps = {
  number: number;
  borderColor?: Color;
  buildingIndex: keyof typeof buildings;
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

const insideColor = (color: Color) => {
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
    default:
      return `${base} from-gray-50`;
  }
};

export default function Square(props: SquareProps) {
  const image = buildings[props.buildingIndex];
  const colorClass = borderColor(props.borderColor || "black");
  const classNameBase =
    "size-48 p-2 m-1 grid content-center justify-items-center h-full ";
  const className = [classNameBase, colorClass].join(" ");
  return (
    <div className={className}>
      <div className={`p-2 ${insideColor(props.borderColor || "black")}`}>
        <div className="relative">
          <Image
            className="pt-12 pr-6 pl-6"
            src={image}
            width={500}
            height={500}
            alt="building"
          />
          <div className="w-full absolute top-0 left-2">
            <span className="font-extrabold text-4xl font-londrina">
              {props.number}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
