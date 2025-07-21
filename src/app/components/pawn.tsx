type Color = "yellow" | "blue" | "green" | "red" | "purple" | "black";

type PawnProps = {
  name: string;
  color: Color;
};

export default function Pawn(props: PawnProps) {
  return (
    <div className="rounded-full bg-amber-500 m-auto mb-1">
      <span className="m-1 text-xl text-gray-100 font-londrina-solid font-extrabold">
        {props.name}
      </span>
    </div>
  );
}
