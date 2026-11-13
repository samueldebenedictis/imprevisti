import type { PawnColor } from "@/model/pawn";
import { colorToCss } from "./ui/color";

/** Pallino del colore della pedina, accanto al nome del giocatore. */
export default function PawnDot({ color }: { color: PawnColor }) {
  return (
    <span
      aria-hidden="true"
      data-pawn-color={color}
      className={`mr-1 inline-block h-3 w-3 rounded-full border-2 border-gray-800 align-middle ${colorToCss(color)}`}
    />
  );
}
