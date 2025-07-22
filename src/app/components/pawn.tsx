import { type Color, colorToCss } from "./color";

type PawnProps = {
  name: string;
  color: Color;
};

export default function Pawn(props: PawnProps) {
  const color = colorToCss(props.color);
  return (
    <div
      className={`text-center border-4 border-gray-800 shadow-xl mb-1 ${color}`}
    >
      <span className="m-1 text-xl text-gray-100 font-londrina-solid font-extrabold">
        {props.name}
      </span>
    </div>
  );
}
