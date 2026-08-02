import type { Meta, StoryObj } from "@storybook/react";
import PlayerRollView from "../src/app/components/player-roll-view";

const meta = {
  title: "SpecialSquares/PlayerDevice/PlayerRollView",
  component: PlayerRollView,
  parameters: {
    layout: "fullscreen",
  },
  globals: {
    viewport: { value: "mobile2", isRotated: false },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof PlayerRollView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WaitingToRoll: Story = {
  args: {
    isRolling: false,
    onRollDice: () => console.log("roll dice"),
  },
};

export const Rolling: Story = {
  args: {
    isRolling: true,
    onRollDice: () => console.log("roll dice"),
  },
};
