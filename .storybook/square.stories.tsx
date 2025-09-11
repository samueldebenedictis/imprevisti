import type { Meta, StoryObj } from "@storybook/react";
import Square from "../src/app/components/square";

const meta = {
  title: "Example/Square",
  component: Square,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Square>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    number: 1,
    squareType: "normal",
  },
};

export const WithPlayers: Story = {
  args: {
    number: 1,
    squareType: "normal",
    playersOn: [
      { name: "Renzo", isCurrentPlayerTurn: true },
      { name: "Lucia", isCurrentPlayerTurn: false },
    ],
  },
};

export const QuizSquare: Story = {
  args: {
    number: 5,
    squareType: "quiz",
  },
};

export const MimeSquare: Story = {
  args: {
    number: 10,
    squareType: "mime",
  },
};

export const MoveSquarePositive: Story = {
  args: {
    number: 15,
    squareType: "move",
    moveValue: 3,
  },
};

export const MoveSquareNegative: Story = {
  args: {
    number: 20,
    squareType: "move",
    moveValue: -2,
  },
};

export const StartSquare: Story = {
  args: {
    number: 0,
    squareType: "first",
  },
};

export const WinSquare: Story = {
  args: {
    number: 24,
    squareType: "last",
  },
};

export const QuizWithPlayers: Story = {
  args: {
    number: 5,
    squareType: "quiz",
    playersOn: [
      { name: "Mario", isCurrentPlayerTurn: true },
      { name: "Giulia", isCurrentPlayerTurn: false },
    ],
  },
};

export const MimeWithMultiplePlayers: Story = {
  args: {
    number: 10,
    squareType: "mime",
    playersOn: [
      { name: "Luca", isCurrentPlayerTurn: false },
      { name: "Anna", isCurrentPlayerTurn: false },
      { name: "Paolo", isCurrentPlayerTurn: true },
    ],
  },
};
