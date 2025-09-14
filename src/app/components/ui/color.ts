export type Color =
  | "yellow"
  | "yellow-light"
  | "blue"
  | "green"
  | "red"
  | "purple"
  | "orange"
  | "teal"
  | "black";

export const colorToCss = (color: Color) => {
  const base = "bg-linear-to-br";
  switch (color) {
    case "yellow":
      return `${base} from-amber-600 to-amber-400`;
    case "yellow-light":
      return `${base} from-amber-300 to-amber-200`;
    case "blue":
      return `${base} from-sky-600 to-sky-400`;
    case "green":
      return `${base} from-green-600 to-green-400`;
    case "red":
      return `${base} from-red-600 to-red-400`;
    case "purple":
      return `${base} from-purple-600 to-purple-400`;
    case "orange":
      return `${base} from-orange-600 to-orange-400`;
    case "teal":
      return `${base} from-teal-600 to-teal-400`;
    default:
      return `${base} from-gray-600 to-gray-400`;
  }
};

export const colorToCssButton = (color: Color) => {
  const base = "bg-linear-to-br";
  switch (color) {
    case "yellow":
      return `${base} from-amber-600 to-amber-500 hover:from-amber-600 hover:to-amber-400`;
    case "blue":
      return `${base} from-sky-600 to-sky-500 hover:from-sky-600 hover:to-sky-400`;
    case "green":
      return `${base} from-green-600 to-green-500 hover:from-green-600 hover:to-green-400`;
    case "red":
      return `${base} from-red-600 to-red-500 hover:from-red-600 hover:to-red-400`;
    case "purple":
      return `${base} from-purple-600 to-purple-500 hover:from-purple-600 hover:to-purple-400`;
    default:
      return `${base} from-gray-600 to-gray-500 hover:from-gray-600 hover:to-gray-400`;
  }
};
