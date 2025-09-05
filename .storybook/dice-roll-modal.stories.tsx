import type { Meta, StoryObj } from "@storybook/react";
import DiceRollModal from "../src/app/components/dice-roll-modal";

const meta = {
  title: "Example/DiceRollModal",
  component: DiceRollModal,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  argTypes: {
    isOpen: {
      control: { type: "boolean" },
    },
    isRolling: {
      control: { type: "boolean" },
    },
    diceResult: {
      control: { type: "select" },
      options: [null, 1, 2, 3, 4, 5, 6],
    },
  },
} satisfies Meta<typeof DiceRollModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isOpen: true,
    onRollDice: () => console.log("Roll dice"),
    isRolling: false,
    diceResult: null,
    onContinue: () => console.log("Continua"),
  },
};

export const Rolling: Story = {
  args: {
    ...Default.args,
    isRolling: true,
  },
};

export const ResultOne: Story = {
  args: {
    ...Default.args,
    diceResult: 1,
  },
};

export const ResultTwo: Story = {
  args: {
    ...Default.args,
    diceResult: 2,
  },
};

export const ResultThree: Story = {
  args: {
    ...Default.args,
    diceResult: 3,
  },
};

export const ResultFour: Story = {
  args: {
    ...Default.args,
    diceResult: 4,
  },
};

export const ResultFive: Story = {
  args: {
    ...Default.args,
    diceResult: 5,
  },
};

export const ResultSix: Story = {
  args: {
    ...Default.args,
    diceResult: 6,
  },
};

export const Closed: Story = {
  args: {
    ...Default.args,
    isOpen: false,
  },
};
