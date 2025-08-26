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
      className={`border-with-focus ${props.className || ""}`}
    >
      {props.options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
