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
      Square({ buildingIndex: 1, number: 1, backgroundColorGradient: "red" }),
      Square({ buildingIndex: 2, number: 2, backgroundColorGradient: "blue" }),
      Square({ buildingIndex: 3, number: 3, backgroundColorGradient: "green" }),
      Square({ buildingIndex: 4, number: 4, backgroundColorGradient: "blue" }),
      Square({ buildingIndex: 5, number: 5, backgroundColorGradient: "blue" }),
    ],
  },
};
