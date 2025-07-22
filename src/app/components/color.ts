export type Color = "yellow" | "blue" | "green" | "red" | "purple" | "black";

export const colorToCss = (color: Color) => {
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
