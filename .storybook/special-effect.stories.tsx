import type { Meta, StoryObj } from "@storybook/react";
import SpecialEffect from "../src/app/components/turn-result-modal/special-effect";

const meta = {
  title: "SpecialSquares/SpecialEffect",
  component: SpecialEffect,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof SpecialEffect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Forward: Story = {
  args: {
    diceResult: 4,
    startPosition: 5,
    newPosition: 12,
    boardSize: 20,
  },
};

export const Backward: Story = {
  args: {
    diceResult: 2,
    startPosition: 5,
    newPosition: 1,
    boardSize: 20,
  },
};

export const BoundaryClamp: Story = {
  args: {
    diceResult: 6,
    startPosition: 16,
    newPosition: 5,
    boardSize: 20,
  },
};

export const NoSpecialEffect: Story = {
  args: {
    diceResult: 3,
    startPosition: 5,
    newPosition: 8,
    boardSize: 20,
  },
};
