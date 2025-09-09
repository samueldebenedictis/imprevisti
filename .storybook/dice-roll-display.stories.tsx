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

// Stories showing DiceRollDisplay within LeftBar context with all edge cases
export const InLeftBarInitial: Story = {
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

export const InLeftBarRolling: Story = {
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

export const InLeftBarResultOne: Story = {
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

export const InLeftBarResultTwo: Story = {
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

export const InLeftBarResultThree: Story = {
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

export const InLeftBarResultFour: Story = {
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

export const InLeftBarResultFive: Story = {
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

export const InLeftBarResultSix: Story = {
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

export const InLeftBarSkipTurn: Story = {
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

export const InLeftBarSkipTurnWithoutName: Story = {
  args: {
    onRollDice: () => {},
    onContinue: () => {},
    isRolling: false,
    diceResult: 0,
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
          diceResult: 0,
          showResult: true,
        }}
      />
    );
  },
  parameters: {
    layout: "fullscreen",
  },
};

export const InLeftBarWithPlayerName: Story = {
  args: {
    onRollDice: () => {},
    onContinue: () => {},
    isRolling: false,
    diceResult: 4,
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
          diceResult: 4,
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

export const InLeftBarAutoShowResult: Story = {
  args: {
    onRollDice: () => {},
    onContinue: () => {},
    isRolling: false,
    diceResult: 3,
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
          onContinue: () => {},
          isRolling: false,
          diceResult: 3,
          showResult: false,
        }}
      />
    );
  },
  parameters: {
    layout: "fullscreen",
  },
};

export const InLeftBarRollingWithResult: Story = {
  args: {
    onRollDice: () => {},
    isRolling: true,
    diceResult: 4,
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
          diceResult: 4,
          showResult: false,
        }}
      />
    );
  },
  parameters: {
    layout: "fullscreen",
  },
};

export const InLeftBarUndefinedResult: Story = {
  args: {
    onRollDice: () => {},
    isRolling: false,
    diceResult: undefined,
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
          diceResult: undefined,
          showResult: false,
        }}
      />
    );
  },
  parameters: {
    layout: "fullscreen",
  },
};

export const InLeftBarNullResult: Story = {
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

export const InLeftBarShowResultWithoutDiceResult: Story = {
  args: {
    onRollDice: () => {},
    onContinue: () => {},
    isRolling: false,
    diceResult: null,
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
          diceResult: null,
          showResult: true,
        }}
      />
    );
  },
  parameters: {
    layout: "fullscreen",
  },
};

export const InLeftBarSkipTurnAutoShow: Story = {
  args: {
    onRollDice: () => {},
    onContinue: () => {},
    isRolling: false,
    diceResult: 0,
    showResult: false,
    currentPlayerName: "Bob",
  },
  render: () => {
    const mockPlayer = new MockPlayer(1, "Bob");
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
          showResult: false,
          currentPlayerName: "Bob",
        }}
      />
    );
  },
  parameters: {
    layout: "fullscreen",
  },
};
