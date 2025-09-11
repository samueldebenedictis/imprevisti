"use client";

export function Label(props: { children: string; htmlFor: string }) {
  return (
    <label htmlFor={props.htmlFor} className="ui-text-dark ui-text-subtitle">
      {props.children}
    </label>
  );
}

export function LabelCheckbox(props: { children: string; htmlFor: string }) {
  return (
    <label htmlFor={props.htmlFor} className="ui-text-dark ui-text-normal">
      {props.children}
    </label>
  );
}
