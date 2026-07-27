import type { Meta, StoryObj } from "@storybook/react";
import HostBattleOverlay from "../src/app/components/host-battle-overlay";

const meta = {
  title: "SpecialSquares/HostDevice/HostBattleOverlay",
  component: HostBattleOverlay,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof HostBattleOverlay>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    players: [
      { id: "1", name: "Giocatore 1" },
      { id: "2", name: "Giocatore 2" },
    ],
    onResolve: (winnerId) => console.log(`Battle winner: ${winnerId}`),
  },
};

export const Resolving: Story = {
  args: {
    ...Default.args,
    isResolving: true,
  },
};
