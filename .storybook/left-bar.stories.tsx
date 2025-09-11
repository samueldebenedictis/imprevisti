import type { Meta, StoryObj } from "@storybook/react";
import LeftBar from "../src/app/components/left-bar";
import { Player } from "../src/model/player";

// Mock Player class
class MockPlayer extends Player {}

// Mock GameJSON
const mockGameJSON = {
  players: [],
  board: { squares: [] },
  turn: 0,
  winner: null,
  gameEnded: false,
};

const meta = {
  title: "Example/LeftBar",
  component: LeftBar,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    gameEnded: {
      control: { type: "boolean" },
      description: "Whether the game has ended",
    },
  },
} satisfies Meta<typeof LeftBar>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockPlayers = [
  new MockPlayer(1, "Giocatore 1"),
  new MockPlayer(2, "Giocatore 2"),
  new MockPlayer(3, "Giocatore 3"),
];

const playersPositions = [
  { name: "Giocatore 1", position: 5 },
  { name: "Giocatore 2", position: 3 },
  { name: "Giocatore 3", position: 7 },
];

export const Default: Story = {
  args: {
    currentPlayer: mockPlayers[0],
    playersPositions: playersPositions,
    gameEnded: false,
    winnerName: undefined,
    onPlayTurnClick: () => console.log("Play turn clicked"),
    onDeleteGame: () => console.log("Delete game clicked"),
    gameInstance: mockGameJSON,
  },
};

export const GameEnded: Story = {
  args: {
    ...Default.args,
    gameEnded: true,
    winnerName: "Giocatore 1",
  },
};

export const DifferentPlayerTurn: Story = {
  args: {
    ...Default.args,
    currentPlayer: mockPlayers[1],
  },
};

export const SinglePlayer: Story = {
  args: {
    ...Default.args,
    playersPositions: [{ name: "Giocatore 1", position: 5 }],
  },
};

export const ManyPlayers: Story = {
  args: {
    ...Default.args,
    playersPositions: [
      { name: "Giocatore 1", position: 5 },
      { name: "Giocatore 2", position: 3 },
      { name: "Giocatore 3", position: 7 },
      { name: "Giocatore 4", position: 2 },
      { name: "Giocatore 5", position: 8 },
      { name: "Giocatore 6", position: 1 },
    ],
  },
};
