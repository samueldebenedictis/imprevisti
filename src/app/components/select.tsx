"use client";

import type React from "react";

type SelectProps = {
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string | number; label: string }[];
  className?: string;
};

export default function Select(props: SelectProps) {
  return (
    <select
      value={props.value}
      onChange={props.onChange}
      className={`border-2 border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${props.className || ""}`}
    >
      {props.options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
