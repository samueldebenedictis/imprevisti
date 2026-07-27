import type { Meta, StoryObj } from "@storybook/react";
import PlayersPanel from "../src/app/components/players-panel";

const meta = {
  title: "Multiscreen/PlayersPanel",
  component: PlayersPanel,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof PlayersPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    selfId: "1",
    positions: [
      { id: "1", name: "Giocatore 1", position: 5 },
      { id: "2", name: "Giocatore 2", position: 3 },
      { id: "3", name: "Giocatore 3", position: 7 },
    ],
  },
};

export const SelfNotFirst: Story = {
  args: {
    selfId: "3",
    positions: [
      { id: "1", name: "Giocatore 1", position: 5 },
      { id: "2", name: "Giocatore 2", position: 3 },
      { id: "3", name: "Giocatore 3", position: 7 },
    ],
  },
};

export const Empty: Story = {
  args: {
    selfId: "1",
    positions: [],
  },
};
