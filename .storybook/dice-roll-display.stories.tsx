import type { Meta, StoryObj } from "@storybook/react";
import DiceRollComponent from "../src/app/components/dice-roll-display";

const meta = {
  title: "Example/DiceRollDisplay",
  component: DiceRollComponent,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    onRollDice: { action: "rolled" },
    onContinue: { action: "continued" },
    isRolling: {
      control: { type: "boolean" },
    },
    diceResult: {
      control: { type: "select" },
      options: [undefined, null, 0, 1, 2, 3, 4, 5, 6],
    },
    showResult: {
      control: { type: "boolean" },
    },
    currentPlayerName: {
      control: { type: "text" },
    },
  },
} satisfies Meta<typeof DiceRollComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const InitialState: Story = {
  args: {
    onRollDice: () => {},
    isRolling: false,
    diceResult: null,
    showResult: false,
  },
};

export const Rolling: Story = {
  args: {
    onRollDice: () => {},
    isRolling: true,
    diceResult: null,
    showResult: false,
  },
};

export const ResultOne: Story = {
  args: {
    onRollDice: () => {},
    onContinue: () => {},
    isRolling: false,
    diceResult: 1,
    showResult: true,
  },
};

export const ResultTwo: Story = {
  args: {
    onRollDice: () => {},
    onContinue: () => {},
    isRolling: false,
    diceResult: 2,
    showResult: true,
  },
};

export const ResultThree: Story = {
  args: {
    onRollDice: () => {},
    onContinue: () => {},
    isRolling: false,
    diceResult: 3,
    showResult: true,
  },
};

export const ResultFour: Story = {
  args: {
    onRollDice: () => {},
    onContinue: () => {},
    isRolling: false,
    diceResult: 4,
    showResult: true,
  },
};

export const ResultFive: Story = {
  args: {
    onRollDice: () => {},
    onContinue: () => {},
    isRolling: false,
    diceResult: 5,
    showResult: true,
  },
};

export const ResultSix: Story = {
  args: {
    onRollDice: () => {},
    onContinue: () => {},
    isRolling: false,
    diceResult: 6,
    showResult: true,
  },
};

export const SkipTurn: Story = {
  args: {
    onRollDice: () => {},
    onContinue: () => {},
    isRolling: false,
    diceResult: 0,
    showResult: true,
    currentPlayerName: "Player 1",
  },
};

export const SkipTurnWithoutName: Story = {
  args: {
    onRollDice: () => {},
    onContinue: () => {},
    isRolling: false,
    diceResult: 0,
    showResult: true,
  },
};

export const WithPlayerName: Story = {
  args: {
    onRollDice: () => {},
    onContinue: () => {},
    isRolling: false,
    diceResult: 4,
    showResult: true,
    currentPlayerName: "Alice",
  },
};

export const AutoShowResult: Story = {
  args: {
    onRollDice: () => {},
    onContinue: () => {},
    isRolling: false,
    diceResult: 3,
    showResult: false, // Will show automatically due to diceResult
  },
};

export const RollingWithResult: Story = {
  args: {
    onRollDice: () => {},
    isRolling: true,
    diceResult: 4,
    showResult: false, // Result won't show while rolling
  },
};

export const UndefinedResult: Story = {
  args: {
    onRollDice: () => {},
    isRolling: false,
    diceResult: undefined,
    showResult: false,
  },
};

export const NullResult: Story = {
  args: {
    onRollDice: () => {},
    isRolling: false,
    diceResult: null,
    showResult: false,
  },
};

export const ShowResultWithoutDiceResult: Story = {
  args: {
    onRollDice: () => {},
    onContinue: () => {},
    isRolling: false,
    diceResult: null,
    showResult: true,
  },
};

export const SkipTurnAutoShow: Story = {
  args: {
    onRollDice: () => {},
    onContinue: () => {},
    isRolling: false,
    diceResult: 0,
    showResult: false, // Will show automatically due to diceResult
    currentPlayerName: "Bob",
  },
};
