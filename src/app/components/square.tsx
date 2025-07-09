import Image from "next/image";
import { buildings } from "./building";

type Color = "yellow" | "blue" | "green" | "red" | "white";

type SquareProps = {
  number: number;
  backgroundColorGradient?: Color;
  buildingIndex: keyof typeof buildings;
};

const squareColor = (color: Color) => {
  const base = "bg-linear-to-b text-white outline-4 -outline-offset-8";
  switch (color) {
    case "yellow":
      return `${base} from-amber-500 to-yellow-300`;
    case "blue":
      return `${base} from-sky-500 to-blue-300`;
    case "green":
      return `${base} from-green-500 to-emerald-300`;
    case "red":
      return `${base} from-red-500 to-orange-300`;
    default:
      return "bg-white text-black outline-4 -outline-offset-8";
  }
};

export default function Square(props: SquareProps) {
  const image = buildings[props.buildingIndex];
  const colorClass = squareColor(props.backgroundColorGradient || "white");
  const classNameBase =
    "rounded-xl size-48 p-4 m-2 grid content-center justify-items-center h-full";
  const className = [classNameBase, colorClass].join(" ");
  return (
    <div className={className}>
      <div className="relative text-center">
        <Image
          className="pt-12 pr-6 pl-6"
          src={image}
          width={500}
          height={500}
          alt="building"
        />
        <div className="w-full absolute top-0">
          <span className="text-white font-extrabold text-6xl">
            {props.number}
          </span>
        </div>
      </div>
    </div>
  );
}
