"use client";

import type { SquareType } from "@/model/square/square";
import Pawn from "./pawn";
import { type Color, colorToCss } from "./ui/color";

type SquareProps = {
  number: number;
  squareType: SquareType;
  moveValue?: number;
  playersOn?: { name: string; isCurrentPlayerTurn: boolean }[];
  boardSize?: number;
  isMoving?: boolean;
};

const typeToColor = (type: SquareType, moveValue?: number): Color => {
  switch (type) {
    case "mime":
      return "purple";
    case "quiz":
      return "yellow";
    case "move":
      if (moveValue && moveValue > 0) {
        return "green";
      }
      return "red";
    case "normal":
      return "blue";
    default:
      return "black";
  }
};

const text = (n: number, boardSize?: number) => {
  const classBase = "ui-text-light m-auto";
  if (n === 0) {
    return <span className={`${classBase} ui-text-title`}>START</span>;
  } else if (n + 1 === boardSize) {
    return <span className={`${classBase} ui-text-title`}>WIN!</span>;
  } else {
    return <span className={`${classBase} ui-text-title text-7xl`}>{n}</span>;
  }
};

const typeText = (type: SquareType, moveValue: number | undefined) => {
  let displayText = "";
  if (type === "move" && moveValue !== undefined) {
    const sign = moveValue > 0 ? " AVANTI +" : "INDIETRO ";
    displayText = `${sign}${moveValue}`;
  } else if (type === "quiz") {
    displayText = "QUIZ";
  } else if (type === "mime") {
    displayText = "MIMO";
  } else {
    return null;
  }
  return (
    <span className="ui-text-light ui-text-subtitle -translate-x-1/2 absolute top-1 left-1/2 transform whitespace-nowrap">
      {displayText}
    </span>
  );
};

const playersOn = (
  players: { name: string; isCurrentPlayerTurn: boolean }[] | undefined,
  isMoving?: boolean,
) => {
  if (!players || players.length === 0) {
    return null;
  }

  const currentPlayer = players.find((p) => p.isCurrentPlayerTurn);
  const otherPlayers = players.filter((p) => !p.isCurrentPlayerTurn);

  const pawns = [];

  // Pedina del giocatore corrente
  // Viene sempre mostrata con animazione
  if (currentPlayer) {
    pawns.push(
      Pawn({
        name: currentPlayer.name,
        color: "yellow",
        isCurrentPlayerTurn: true,
        isMoving, // Solo il giocatore corrente si anima
      }),
    );
  }

  // Se ci sono altri giocatori
  if (otherPlayers.length > 0) {
    if (otherPlayers.length === 1) {
      // Solo un altro giocatore
      // Viene mostrato il nome
      const el = otherPlayers[0];
      pawns.push(
        Pawn({
          name: el.name,
          color: "yellow",
          isCurrentPlayerTurn: false,
          isMoving: false, // Gli altri giocatori non si animano
        }),
      );
    } else {
      // Due o più giocatori
      // Viene mostrati il count
      pawns.push(
        Pawn({
          name: `${otherPlayers.length.toString()} giocatori`,
          color: "yellow",
          isCurrentPlayerTurn: false,
          isMoving: false, // Gli altri giocatori non si animano
        }),
      );
    }
  }

  return pawns;
};

const background = (number: number) => {
  return `square-background-${number % 13}`;
};

export default function Square(props: SquareProps) {
  const typeColor = typeToColor(props.squareType, props.moveValue);
  const color = colorToCss(
    props.number === 0 || props.number + 1 === props.boardSize
      ? "teal"
      : typeColor,
  );
  const bg = background(props.number);
  return (
    <div className="ui-border-dark relative shadow-xl">
      <div className={`h-32 w-32 ${color}`}>
        <div className={`h-full ${bg}`}></div>
      </div>
      <div className="absolute top-0 flex h-full w-full text-center">
        {text(props.number, props.boardSize)}
      </div>
      {typeText(props.squareType, props.moveValue)}
      <div className="absolute bottom-0 w-full pr-1 pl-1">
        {playersOn(props.playersOn, props.isMoving)}
      </div>
    </div>
  );
}
