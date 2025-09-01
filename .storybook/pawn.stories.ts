import type { Meta, StoryObj } from "@storybook/react";
import Pawn from "../src/app/components/pawn";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: "Example/Pawn",
  component: Pawn,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: "centered",
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs"],
} satisfies Meta<typeof Pawn>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const SinglePlayer: Story = {
  args: {
    color: "yellow",
    name: "Samuel",
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
    isStacked: true,
  },
};
