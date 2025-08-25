export type Color = "yellow" | "blue" | "green" | "red" | "purple" | "black";

export const colorToCss = (color: Color) => {
  const base = "bg-linear-to-br";
  switch (color) {
    case "yellow":
      return `${base} from-amber-600 to-amber-400`;
    case "blue":
      return `${base} from-sky-600 to-sky-400`;
    case "green":
      return `${base} from-green-600 to-green-400`;
    case "red":
      return `${base} from-red-600 to-red-400`;
    case "purple":
      return `${base} from-purple-600 to-purple-400`;
    default:
      return `${base} from-gray-600 to-gray-400`;
  }
};
