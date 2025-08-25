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
};

export default function Input(props: InputProps) {
  return (
    <input
      type={props.type || "text"}
      value={props.value}
      onChange={props.onChange}
      placeholder={props.placeholder}
      className={`border-2 border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${props.className || ""}`}
    />
  );
}
