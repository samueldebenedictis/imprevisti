"use client";

import type React from "react";
import { type Color, colorToCssButton } from "./color";

type ButtonProps = {
  onClick?: () => void;
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
      type={props.type ?? "button"}
      onClick={props.onClick ?? undefined}
      disabled={props.disabled}
      className={`subtitle animation-scale m-2 flex h-12 w-full cursor-pointer items-center justify-center border-nero text-bianco shadow-xl ${buttonColorClass} ${props.className || ""}`}
    >
      {props.children}
    </button>
  );
}
