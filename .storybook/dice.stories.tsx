import type { Meta, StoryObj } from "@storybook/react";
import Dice from "../src/app/components/dice";

const meta = {
  title: "Example/Dice",
  component: Dice,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    isRolling: {
      control: { type: "boolean" },
    },
    result: {
      control: { type: "select" },
      options: [null, 1, 2, 3, 4, 5, 6],
    },
  },
} satisfies Meta<typeof Dice>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isRolling: false,
    result: null,
  },
};

export const Rolling: Story = {
  args: {
    isRolling: true,
    result: null,
  },
};

export const ResultOne: Story = {
  args: {
    isRolling: false,
    result: 1,
  },
};

export const ResultTwo: Story = {
  args: {
    isRolling: false,
    result: 2,
  },
};

export const ResultThree: Story = {
  args: {
    isRolling: false,
    result: 3,
  },
};

export const ResultFour: Story = {
  args: {
    isRolling: false,
    result: 4,
  },
};

export const ResultFive: Story = {
  args: {
    isRolling: false,
    result: 5,
  },
};

export const ResultSix: Story = {
  args: {
    isRolling: false,
    result: 6,
  },
};
