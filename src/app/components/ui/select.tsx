"use client";

import type React from "react";

type SelectProps = {
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string | number; label: string }[];
  className?: string;
  placeholder?: string;
};

export default function Select(props: SelectProps) {
  return (
    <select
      value={props.value}
      onChange={props.onChange}
      className={`ui-text-dark ui-border-focus w-full p-2 ${props.className || ""}`}
    >
      {props.placeholder && (
        <option value="" disabled hidden>
          {props.placeholder}
        </option>
      )}
      {props.options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
