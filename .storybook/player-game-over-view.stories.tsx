import type { Meta, StoryObj } from "@storybook/react";
import PlayerGameOverView from "../src/app/components/player-game-over-view";

const meta = {
  title: "SpecialSquares/PlayerDevice/PlayerGameOverView",
  component: PlayerGameOverView,
  parameters: {
    layout: "fullscreen",
  },
  globals: {
    viewport: { value: "mobile2", isRotated: false },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof PlayerGameOverView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    winnerName: "Alice",
  },
};
