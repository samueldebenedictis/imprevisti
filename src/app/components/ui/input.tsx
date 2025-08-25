"use client";

import type React from "react";
import { borderClasses } from "./common-styles";

type InputProps = {
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
  type?: string;
  id?: string;
  name?: string;
  min?: string;
  required?: boolean;
};

export default function Input(props: InputProps) {
  return (
    <input
      type={props.type || "text"}
      value={props.value}
      onChange={props.onChange}
      placeholder={props.placeholder}
      className={`w-full px-2 py-2 text-gray-800 ${borderClasses} ${props.className || ""}`}
      required={props.required || false}
      min={props.min || undefined}
      id={props.id || undefined}
    />
  );
}
