import type { Meta, StoryObj } from "@storybook/react";
import DiceResultModal from "../src/app/components/dice-result-modal";
import { Battle } from "../src/model/battle";
import { Mime, Quiz } from "../src/model/deck";
import { Player } from "../src/model/player";

// Mock classes
class MockPlayer extends Player {}
class MockBattle extends Battle {}
class MockCard {
  constructor(
    public cardTitle: string,
    public cardText: string,
  ) {}
}
class MockQuiz extends Quiz {}
class MockMime extends Mime {}

const meta = {
  title: "Example/DiceResultModal",
  component: DiceResultModal,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  argTypes: {
    actionType: {
      control: { type: "select" },
      options: ["battle", "quiz", "mime", null],
    },
  },
} satisfies Meta<typeof DiceResultModal>;

export default meta;
type Story = StoryObj<typeof meta>;

const allPlayers = [
  new MockPlayer(1, "Giocatore 1"),
  new MockPlayer(2, "Giocatore 2"),
  new MockPlayer(3, "Giocatore 3"),
];

export const Default: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log("Close modal"),
    diceResult: 5,
    actionType: null,
    actionData: null,
    allPlayers: allPlayers,
  },
};

export const BattleScenario: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log("Close modal"),
    diceResult: 3,
    actionType: "battle",
    actionData: new MockBattle(allPlayers[0], allPlayers[1]),
    onResolveBattle: (winnerId) => console.log(`Battle winner: ${winnerId}`),
    allPlayers: allPlayers,
  },
};

export const QuizScenario: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log("Close modal"),
    diceResult: 2,
    actionType: "quiz",
    actionData: new MockQuiz(
      allPlayers[0],
      new MockCard("Qual è la capitale dell'Italia?", "Roma"),
    ),
    onResolveQuiz: (success) => console.log(`Quiz success: ${success}`),
    allPlayers: allPlayers,
  },
};

export const MimeScenario: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log("Close modal"),
    diceResult: 1,
    actionType: "mime",
    actionData: new MockMime(
      allPlayers[0],
      new MockCard("Titolo mimo", "Mimo"),
    ),
    onResolveMime: (success, guesserId) =>
      console.log(`Mime success: ${success}, Guesser: ${guesserId}`),
    allPlayers: allPlayers,
  },
};
