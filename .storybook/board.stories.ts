import type { Meta, StoryObj } from "@storybook/react";
import Board from "../src/app/components/board";
import Square from "../src/app/components/square";

const meta = {
  title: "Example/Board",
  component: Board,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Board>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    squares: [
      Square({ number: 0, squareType: "normal" }),
      Square({ number: 1, squareType: "normal" }),
      Square({ number: 2, squareType: "mime" }),
      Square({ number: 3, squareType: "normal" }),
      Square({ number: 4, squareType: "quiz" }),
      Square({ number: 5, squareType: "normal" }),
      Square({ number: 6, squareType: "move", moveValue: 1 }),
      Square({ number: 7, squareType: "move", moveValue: -1 }),
      Square({ number: 8, squareType: "normal" }),
    ],
  },
};

export const EmptyBoard: Story = {
  args: {
    squares: [],
  },
};

export const SingleSquare: Story = {
  args: {
    squares: [Square({ number: 0, squareType: "normal" })],
  },
};

export const LargeBoard: Story = {
  args: {
    squares: Array.from({ length: 25 }, (_, i) =>
      Square({
        number: i,
        squareType: "normal",
      }),
    ),
  },
};
