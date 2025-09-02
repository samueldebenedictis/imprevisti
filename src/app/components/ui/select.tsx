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
      {props.options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
      {props.placeholder && (
        <option value="" selected disabled hidden>
          {props.placeholder}
        </option>
      )}
    </select>
  );
}
