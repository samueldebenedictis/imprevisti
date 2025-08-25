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

export const colorToCssButton = (color: Color) => {
  switch (color) {
    case "yellow":
      return `${colorToCss(color)} hover:from-amber-600 hover:to-amber-500`;
    case "blue":
      return `${colorToCss(color)} hover:from-sky-600 hover:to-sky-500`;
    case "green":
      return `${colorToCss(color)} hover:from-green-600 hover:to-green-500`;
    case "red":
      return `${colorToCss(color)} hover:from-red-600 hover:to-red-500`;
    case "purple":
      return `${colorToCss(color)} hover:from-purple-600 hover:to-purple-500`;
    default:
      return `${colorToCss(color)} hover:from-gray-600 hover:to-gray-500`;
  }
};
