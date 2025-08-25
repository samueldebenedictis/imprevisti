"use client";

import type React from "react";
import { type Color, colorToCss } from "./color";

type ButtonProps = {
  onClick: () => void;
  children: React.ReactNode;
  color?: Color;
  disabled?: boolean;
  className?: string;
};

export default function Button(props: ButtonProps) {
  const buttonColorClass = props.color
    ? colorToCss(props.color)
    : colorToCss("black");

  return (
    <button
      type="button"
      onClick={props.onClick}
      disabled={props.disabled}
      className={`flex h-12 w-full border-4 border-gray-800 shadow-xl justify-center items-center font-londrina-solid font-extrabold text-xl text-gray-100 mb-2 ${buttonColorClass} ${props.className || ""}`}
    >
      {props.children}
    </button>
  );
}
