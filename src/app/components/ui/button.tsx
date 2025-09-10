"use client";

import type React from "react";
import { soundManager } from "../../utils/sound-manager";
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
  const animated = props.disabled ? "" : "ui-animation-scale cursor-pointer";

  const handleClick = () => {
    if (!props.disabled && props.onClick) {
      // Genera il suono
      soundManager.playButtonClick();
      // Esegue l'azione
      props.onClick();
    }
  };

  return (
    <button
      type={props.type ?? "button"}
      onClick={handleClick}
      disabled={props.disabled}
      className={`ui-text-subtitle ui-text-light ui-border-dark m-2 flex h-12 items-center justify-center p-2 shadow-xl ${animated} ${buttonColorClass} ${props.className || ""}`}
    >
      {props.children}
    </button>
  );
}
