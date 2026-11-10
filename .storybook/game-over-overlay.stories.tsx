import type { Meta, StoryObj } from "@storybook/react";
import GameOverOverlay from "../src/app/components/game-over-overlay";

const meta = {
  title: "Example/GameOverOverlay",
  component: GameOverOverlay,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof GameOverOverlay>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    winnerName: "Alice",
  },
};

export const SingleScreen: Story = {
  args: {
    winnerName: "Alice",
    homeLabel: "Nuova partita",
  },
};
