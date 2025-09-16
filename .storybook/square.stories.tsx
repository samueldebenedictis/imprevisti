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

export const MusicEmotionSquare: Story = {
  args: {
    number: 12,
    squareType: "music-emotion",
  },
};

export const PhysicalTestSquare: Story = {
  args: {
    number: 14,
    squareType: "physical-test",
  },
};

export const WhatWouldYouDoSquare: Story = {
  args: {
    number: 16,
    squareType: "what-would-you-do",
  },
};

export const MusicEmotionWithPlayers: Story = {
  args: {
    number: 12,
    squareType: "music-emotion",
    playersOn: [
      { name: "Sofia", isCurrentPlayerTurn: true },
      { name: "Marco", isCurrentPlayerTurn: false },
    ],
  },
};

export const PhysicalTestWithPlayers: Story = {
  args: {
    number: 14,
    squareType: "physical-test",
    playersOn: [
      { name: "Elena", isCurrentPlayerTurn: false },
      { name: "Davide", isCurrentPlayerTurn: true },
    ],
  },
};

export const WhatWouldYouDoWithPlayers: Story = {
  args: {
    number: 16,
    squareType: "what-would-you-do",
    playersOn: [
      { name: "Chiara", isCurrentPlayerTurn: true },
      { name: "Roberto", isCurrentPlayerTurn: false },
      { name: "Francesca", isCurrentPlayerTurn: false },
    ],
  },
};

export const DictationDrawSquare: Story = {
  args: {
    number: 18,
    squareType: "dictation-draw",
  },
};

export const DictationDrawWithPlayers: Story = {
  args: {
    number: 18,
    squareType: "dictation-draw",
    playersOn: [
      { name: "Valentina", isCurrentPlayerTurn: true },
      { name: "Andrea", isCurrentPlayerTurn: false },
    ],
  },
};
