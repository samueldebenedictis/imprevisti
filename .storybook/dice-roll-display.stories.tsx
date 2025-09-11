import type { Meta, StoryObj } from "@storybook/react";
import DiceRollComponent from "../src/app/components/dice-roll-display";
import LeftBar from "../src/app/components/left-bar";
import { Player } from "../src/model/player";

// Mock player for stories
class MockPlayer extends Player {}

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

// Stories showing DiceRollDisplay within LeftBar context with all edge cases
export const Initial: Story = {
  args: {
    onRollDice: () => {},
    isRolling: false,
    diceResult: null,
    showResult: false,
  },
  render: () => {
    const mockPlayer = new MockPlayer(1, "Alice");
    const playersPositions = [
      { name: "Alice", position: 5 },
      { name: "Bob", position: 3 },
    ];

    return (
      <LeftBar
        currentPlayer={mockPlayer}
        playersPositions={playersPositions}
        gameEnded={false}
        winnerName={undefined}
        onPlayTurnClick={() => {}}
        onDeleteGame={() => {}}
        gameInstance={{}}
        showDiceRoll={true}
        diceRollProps={{
          onRollDice: () => {},
          isRolling: false,
          diceResult: null,
          showResult: false,
        }}
      />
    );
  },
  parameters: {
    layout: "fullscreen",
  },
};

export const Rolling: Story = {
  args: {
    onRollDice: () => {},
    isRolling: true,
    diceResult: null,
    showResult: false,
  },
  render: () => {
    const mockPlayer = new MockPlayer(1, "Alice");
    const playersPositions = [
      { name: "Alice", position: 5 },
      { name: "Bob", position: 3 },
    ];

    return (
      <LeftBar
        currentPlayer={mockPlayer}
        playersPositions={playersPositions}
        gameEnded={false}
        winnerName={undefined}
        onPlayTurnClick={() => {}}
        onDeleteGame={() => {}}
        gameInstance={{}}
        showDiceRoll={true}
        diceRollProps={{
          onRollDice: () => {},
          isRolling: true,
          diceResult: null,
          showResult: false,
        }}
      />
    );
  },
  parameters: {
    layout: "fullscreen",
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
  render: () => {
    const mockPlayer = new MockPlayer(1, "Alice");
    const playersPositions = [
      { name: "Alice", position: 5 },
      { name: "Bob", position: 3 },
    ];

    return (
      <LeftBar
        currentPlayer={mockPlayer}
        playersPositions={playersPositions}
        gameEnded={false}
        winnerName={undefined}
        onPlayTurnClick={() => {}}
        onDeleteGame={() => {}}
        gameInstance={{}}
        showDiceRoll={true}
        diceRollProps={{
          onRollDice: () => {},
          onContinue: () => {},
          isRolling: false,
          diceResult: 1,
          showResult: true,
        }}
      />
    );
  },
  parameters: {
    layout: "fullscreen",
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
  render: () => {
    const mockPlayer = new MockPlayer(1, "Alice");
    const playersPositions = [
      { name: "Alice", position: 5 },
      { name: "Bob", position: 3 },
    ];

    return (
      <LeftBar
        currentPlayer={mockPlayer}
        playersPositions={playersPositions}
        gameEnded={false}
        winnerName={undefined}
        onPlayTurnClick={() => {}}
        onDeleteGame={() => {}}
        gameInstance={{}}
        showDiceRoll={true}
        diceRollProps={{
          onRollDice: () => {},
          onContinue: () => {},
          isRolling: false,
          diceResult: 2,
          showResult: true,
        }}
      />
    );
  },
  parameters: {
    layout: "fullscreen",
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
  render: () => {
    const mockPlayer = new MockPlayer(1, "Alice");
    const playersPositions = [
      { name: "Alice", position: 5 },
      { name: "Bob", position: 3 },
    ];

    return (
      <LeftBar
        currentPlayer={mockPlayer}
        playersPositions={playersPositions}
        gameEnded={false}
        winnerName={undefined}
        onPlayTurnClick={() => {}}
        onDeleteGame={() => {}}
        gameInstance={{}}
        showDiceRoll={true}
        diceRollProps={{
          onRollDice: () => {},
          onContinue: () => {},
          isRolling: false,
          diceResult: 3,
          showResult: true,
        }}
      />
    );
  },
  parameters: {
    layout: "fullscreen",
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
  render: () => {
    const mockPlayer = new MockPlayer(1, "Alice");
    const playersPositions = [
      { name: "Alice", position: 5 },
      { name: "Bob", position: 3 },
    ];

    return (
      <LeftBar
        currentPlayer={mockPlayer}
        playersPositions={playersPositions}
        gameEnded={false}
        winnerName={undefined}
        onPlayTurnClick={() => {}}
        onDeleteGame={() => {}}
        gameInstance={{}}
        showDiceRoll={true}
        diceRollProps={{
          onRollDice: () => {},
          onContinue: () => {},
          isRolling: false,
          diceResult: 4,
          showResult: true,
        }}
      />
    );
  },
  parameters: {
    layout: "fullscreen",
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
  render: () => {
    const mockPlayer = new MockPlayer(1, "Alice");
    const playersPositions = [
      { name: "Alice", position: 5 },
      { name: "Bob", position: 3 },
    ];

    return (
      <LeftBar
        currentPlayer={mockPlayer}
        playersPositions={playersPositions}
        gameEnded={false}
        winnerName={undefined}
        onPlayTurnClick={() => {}}
        onDeleteGame={() => {}}
        gameInstance={{}}
        showDiceRoll={true}
        diceRollProps={{
          onRollDice: () => {},
          onContinue: () => {},
          isRolling: false,
          diceResult: 5,
          showResult: true,
        }}
      />
    );
  },
  parameters: {
    layout: "fullscreen",
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
  render: () => {
    const mockPlayer = new MockPlayer(1, "Alice");
    const playersPositions = [
      { name: "Alice", position: 5 },
      { name: "Bob", position: 3 },
    ];

    return (
      <LeftBar
        currentPlayer={mockPlayer}
        playersPositions={playersPositions}
        gameEnded={false}
        winnerName={undefined}
        onPlayTurnClick={() => {}}
        onDeleteGame={() => {}}
        gameInstance={{}}
        showDiceRoll={true}
        diceRollProps={{
          onRollDice: () => {},
          onContinue: () => {},
          isRolling: false,
          diceResult: 6,
          showResult: true,
        }}
      />
    );
  },
  parameters: {
    layout: "fullscreen",
  },
};

export const SkipTurn: Story = {
  args: {
    onRollDice: () => {},
    onContinue: () => {},
    isRolling: false,
    diceResult: 0,
    showResult: true,
    currentPlayerName: "Alice",
  },
  render: () => {
    const mockPlayer = new MockPlayer(1, "Alice");
    const playersPositions = [
      { name: "Alice", position: 5 },
      { name: "Bob", position: 3 },
    ];

    return (
      <LeftBar
        currentPlayer={mockPlayer}
        playersPositions={playersPositions}
        gameEnded={false}
        winnerName={undefined}
        onPlayTurnClick={() => {}}
        onDeleteGame={() => {}}
        gameInstance={{}}
        showDiceRoll={true}
        diceRollProps={{
          onRollDice: () => {},
          onContinue: () => {},
          isRolling: false,
          diceResult: 0,
          showResult: true,
          currentPlayerName: "Alice",
        }}
      />
    );
  },
  parameters: {
    layout: "fullscreen",
  },
};
