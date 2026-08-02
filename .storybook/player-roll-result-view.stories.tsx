import type { Meta, StoryObj } from "@storybook/react";
import PlayerRollResultView from "../src/app/components/player-roll-result-view";

const meta = {
  title: "SpecialSquares/PlayerDevice/PlayerRollResultView",
  component: PlayerRollResultView,
  parameters: {
    layout: "fullscreen",
  },
  globals: {
    viewport: { value: "mobile2", isRotated: false },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof PlayerRollResultView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NormalSquareResult: Story = {
  args: {
    diceResult: 4,
    moveInfo: {
      actorPlayerId: "1",
      diceResult: 4,
      squareNumber: 9,
      squareType: "normal",
    },
    onContinue: () => console.log("continue"),
  },
};

export const SpecialSquareResult: Story = {
  args: {
    diceResult: 6,
    moveInfo: {
      actorPlayerId: "1",
      diceResult: 6,
      squareNumber: 11,
      squareType: "quiz",
    },
    onContinue: () => console.log("continue"),
  },
};

export const SkippedTurn: Story = {
  args: {
    diceResult: 0,
    moveInfo: {
      actorPlayerId: "1",
      diceResult: 0,
      squareNumber: 5,
      squareType: "normal",
    },
    onContinue: () => console.log("continue"),
  },
};
