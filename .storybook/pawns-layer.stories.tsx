import type { Meta, StoryObj } from "@storybook/react";
import PawnsLayer from "../src/app/components/pawns-layer";
import { defaultPawn, type PawnStyle } from "../src/model/pawn";

const meta = {
  title: "Example/PawnsLayer",
  component: PawnsLayer,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  // Una casella del tabellone (cols=1, una sola casella)
  decorators: [
    (Story) => (
      <div className="relative h-44 w-44 bg-sky-500">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PawnsLayer>;

export default meta;
type Story = StoryObj<typeof meta>;

const pawns: PawnStyle[] = [
  defaultPawn(0),
  { color: "purple", shape: "hexagon" },
  { color: "green", shape: "parallelogram" },
  { color: "pink", shape: "pill" },
];

const players = (names: string[]) =>
  names.map((name, i) => ({
    id: String(i),
    name,
    position: 0,
    pawn: pawns[i],
  }));

/** Fino a 3 pedine sulla casella: si vedono tutte. */
export const ThreePawns: Story = {
  args: {
    players: players(["Luca", "Anna", "Sara"]),
    currentPlayerId: "0",
    cols: 1,
    totalSquares: 1,
  },
};

/** Da 4 in su: chi è di turno più la pedina "N giocatori". */
export const FourPawns: Story = {
  args: {
    players: players(["Luca", "Anna", "Sara", "Marco"]),
    currentPlayerId: "0",
    cols: 1,
    totalSquares: 1,
  },
};
