"use client";

import type React from "react";

type InputProps = {
  value: string;
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
      className={`border-4 border-gray-800 p-2 focus:border-4 focus:border-blue-400 focus:outline-none ${props.className || ""}`}
      required={props.required || false}
    />
  );
}
