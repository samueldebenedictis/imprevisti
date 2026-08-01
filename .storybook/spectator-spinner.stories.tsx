import type { Meta, StoryObj } from "@storybook/react";
import SpectatorSpinner from "../src/app/components/spectator-spinner";

const meta = {
  title: "SpecialSquares/PlayerDevice/SpectatorSpinner",
  component: SpectatorSpinner,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof SpectatorSpinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
