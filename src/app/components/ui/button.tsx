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
  const color = props.color
    ? colorToCssButton(props.color)
    : colorToCssButton("black");

  const buttonColorClass = props.disabled ? colorToCssButton("black") : color;
  const animated = props.disabled ? "" : "animation-scale cursor-pointer";

  return (
    <button
      type={props.type ?? "button"}
      onClick={props.onClick ?? undefined}
      disabled={props.disabled}
      className={`testo-sottotitolo ${animated} testo-bianco m-2 flex h-12 items-center justify-center border-nero p-2 shadow-xl ${buttonColorClass} ${props.className || ""}`}
    >
      {props.children}
    </button>
  );
}
