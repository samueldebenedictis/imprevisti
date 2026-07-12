import type { Meta, StoryObj } from "@storybook/react";
import { QrCode } from "../src/app/components/qr-code";

const meta = {
  title: "Multiscreen/QrCode",
  component: QrCode,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    url: {
      control: { type: "text" },
      description: "URL a second device scans to join the session",
    },
    size: {
      control: { type: "number" },
      description: "Rendered canvas size in px",
    },
  },
} satisfies Meta<typeof QrCode>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    url: "https://tesi.app/join/abc123",
  },
};

export const PlayerJoinLink: Story = {
  args: {
    url: "https://tesi.app/player/abc123/player-1",
  },
};

export const Small: Story = {
  args: {
    ...Default.args,
    size: 128,
  },
};

export const Large: Story = {
  args: {
    ...Default.args,
    size: 384,
  },
};
