import type { Meta, StoryObj } from "@storybook/react";
import Board from "../src/app/components/board";
import Square from "../src/app/components/square";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: "Example/Board",
  component: Board,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: "centered",
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs"],
} satisfies Meta<typeof Board>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Primary: Story = {
  args: {
    boardsize: 1,
    squares: [
      Square({ number: 0, squareType: "normal" }),
      Square({ number: 1, squareType: "normal" }),
      Square({ number: 2, squareType: "mime" }),
      Square({ number: 3, squareType: "move" }),
      Square({ number: 4, squareType: "quiz" }),
      Square({ number: 5, squareType: "normal" }),
    ],
  },
};
