"use client";

import type React from "react";

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
      className={`ui-text-dark ui-border-focus w-full p-2 ${props.className || ""}`}
      required={props.required || false}
      min={props.min || undefined}
      id={props.id || undefined}
    />
  );
}
