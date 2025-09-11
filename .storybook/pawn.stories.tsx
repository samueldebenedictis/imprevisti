import type { Meta, StoryObj } from "@storybook/react";
import Pawn from "../src/app/components/pawn";

const meta = {
  title: "Example/Pawn",
  component: Pawn,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Pawn>;

export default meta;
type Story = StoryObj<typeof meta>;

export const YellowPawn: Story = {
  args: {
    color: "yellow",
    name: "Samuel",
    isCurrentPlayerTurn: false,
  },
};

export const BluePawn: Story = {
  args: {
    color: "blue",
    name: "Mario",
    isCurrentPlayerTurn: false,
  },
};

export const RedPawn: Story = {
  args: {
    color: "red",
    name: "Giulia",
    isCurrentPlayerTurn: false,
  },
};

export const GreenPawn: Story = {
  args: {
    color: "green",
    name: "Luca",
    isCurrentPlayerTurn: false,
  },
};

export const CurrentPlayer: Story = {
  args: {
    color: "yellow",
    name: "Samuel",
    isCurrentPlayerTurn: true,
  },
};

export const StackedPlayers: Story = {
  args: {
    color: "yellow",
    name: "2 giocatori",
    isCurrentPlayerTurn: false,
  },
};

export const LongName: Story = {
  args: {
    color: "blue",
    name: "Giocatore con nome molto lungo",
    isCurrentPlayerTurn: false,
  },
};
