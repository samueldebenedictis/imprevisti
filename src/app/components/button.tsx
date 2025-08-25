"use client";

import type React from "react";
import { type Color, colorToCssButton } from "./color";

type ButtonProps = {
  onClick: () => void;
  children: React.ReactNode;
  color?: Color;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
};

export default function Button(props: ButtonProps) {
  const buttonColorClass = props.color
    ? colorToCssButton(props.color)
    : colorToCssButton("black");

  return (
    <button
      type="button"
      onClick={props.onClick}
      disabled={props.disabled}
      className={`mb-2 flex h-12 w-full cursor-pointer items-center justify-center border-4 border-gray-800 font-extrabold font-londrina-solid text-gray-100 text-xl shadow-xl transition-all duration-200 hover:scale-105 ${buttonColorClass} ${props.className || ""}`}
    >
      {props.children}
    </button>
  );
}
