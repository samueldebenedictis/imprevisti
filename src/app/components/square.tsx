"use client";

import type { SquareType } from "@/model/square/square";
import {
  SQUARE_BACKWRITE_BOTTOM,
  SQUARE_BACKWRITE_TOP,
  SQUARE_DICTATION_DRAW_BOTTOM,
  SQUARE_DICTATION_DRAW_TOP,
  SQUARE_FACE_EMOTION_BOTTOM,
  SQUARE_FACE_EMOTION_TOP,
  SQUARE_MIME,
  SQUARE_MOVE_BACKWARD,
  SQUARE_MOVE_FORWARD,
  SQUARE_MUSIC_EMOTION_BOTTOM,
  SQUARE_MUSIC_EMOTION_TOP,
  SQUARE_PHYSICAL_TEST_BOTTOM,
  SQUARE_PHYSICAL_TEST_TOP,
  SQUARE_QUIZ,
  SQUARE_START,
  SQUARE_WHAT_WOULD_YOU_DO_BOTTOM,
  SQUARE_WHAT_WOULD_YOU_DO_TOP,
  SQUARE_WIN,
} from "../texts";
import { type Color, colorToCss } from "./ui/color";

type ExtendedSquareType = SquareType | "first" | "last";
type SquareProps = {
  number: number;
  squareType: ExtendedSquareType;
  moveValue?: number;
};

const typeToColor = (type: ExtendedSquareType, moveValue?: number): Color => {
  switch (type) {
    case "mime":
      return "purple";
    case "quiz":
      return "yellow";
    case "backwrite":
      return "orange";
    case "face-emotion":
      return "violet";
    case "dictation-draw":
      return "indigo";
    case "music-emotion":
      return "pink";
    case "physical-test":
      return "cyan";
    case "what-would-you-do":
      return "lime";
    case "move":
      if (moveValue && moveValue > 0) {
        return "green";
      }
      return "red";
    case "normal":
      return "blue";
    case "first":
    case "last":
      return "teal";
    default:
      return "black";
  }
};

const text = (n: number, squareType: ExtendedSquareType) => {
  const classBase = "ui-text-light m-auto";
  if (squareType === "first" || squareType === "last") {
    return (
      <span className={`${classBase} ui-text-title text-5xl`}>
        {squareType === "first" ? SQUARE_START : SQUARE_WIN}
      </span>
    );
  } else {
    return <span className={`${classBase} ui-text-title text-8xl`}>{n}</span>;
  }
};

const typeText = (type: ExtendedSquareType, moveValue: number | undefined) => {
  let topDisplayText = "";
  let bottomDisplayText = "";
  if (type === "move" && moveValue !== undefined) {
    const text = moveValue > 0 ? SQUARE_MOVE_FORWARD : SQUARE_MOVE_BACKWARD;
    const sign = moveValue > 0 ? "+" : "";
    topDisplayText = `${text}`;
    bottomDisplayText = `${sign}${moveValue}`;
  } else if (type === "quiz") {
    topDisplayText = SQUARE_QUIZ;
  } else if (type === "mime") {
    topDisplayText = SQUARE_MIME;
  } else if (type === "backwrite") {
    topDisplayText = SQUARE_BACKWRITE_TOP;
    bottomDisplayText = SQUARE_BACKWRITE_BOTTOM;
  } else if (type === "music-emotion") {
    topDisplayText = SQUARE_MUSIC_EMOTION_TOP;
    bottomDisplayText = SQUARE_MUSIC_EMOTION_BOTTOM;
  } else if (type === "physical-test") {
    topDisplayText = SQUARE_PHYSICAL_TEST_TOP;
    bottomDisplayText = SQUARE_PHYSICAL_TEST_BOTTOM;
  } else if (type === "what-would-you-do") {
    topDisplayText = SQUARE_WHAT_WOULD_YOU_DO_TOP;
    bottomDisplayText = SQUARE_WHAT_WOULD_YOU_DO_BOTTOM;
  } else if (type === "dictation-draw") {
    topDisplayText = SQUARE_DICTATION_DRAW_TOP;
    bottomDisplayText = SQUARE_DICTATION_DRAW_BOTTOM;
  } else if (type === "face-emotion") {
    topDisplayText = SQUARE_FACE_EMOTION_TOP;
    bottomDisplayText = SQUARE_FACE_EMOTION_BOTTOM;
  } else {
    return null;
  }
  return (
    <>
      <span className="ui-text-light ui-text-subtitle -translate-x-1/2 absolute top-1 left-1/2 transform whitespace-nowrap">
        {topDisplayText}
      </span>
      <span className="ui-text-light ui-text-subtitle -translate-x-1/2 absolute bottom-1 left-1/2 transform whitespace-nowrap">
        {bottomDisplayText}
      </span>
    </>
  );
};

const background = (number: number) => {
  return `square-background-${number % 13}`;
};

export default function Square(props: SquareProps) {
  const typeColor = typeToColor(props.squareType, props.moveValue);
  const color = colorToCss(typeColor);

  const bg = background(props.number);
  return (
    <div className="ui-border-dark relative shadow-xl">
      <div className={`h-40 w-40 ${color}`}>
        <div className={`h-full ${bg}`}></div>
      </div>
      <div className="absolute top-0 flex h-full w-full text-center">
        {text(props.number, props.squareType)}
      </div>
      {typeText(props.squareType, props.moveValue)}
    </div>
  );
}
