import type { Meta, StoryObj } from "@storybook/react";
import { IdleOverlay } from "../src/app/components/idle-overlay";

const meta = {
  title: "Multiscreen/IdleOverlay",
  component: IdleOverlay,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  argTypes: {
    idleState: {
      control: { type: "select" },
      options: ["active", "idle", "stopped"],
      description: "Polling state of this device's session connection",
    },
  },
} satisfies Meta<typeof IdleOverlay>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Active: Story = {
  args: {
    idleState: "active",
    onResume: () => console.log("Resume clicked"),
  },
};

export const Idle: Story = {
  args: {
    idleState: "idle",
    onResume: () => console.log("Resume clicked"),
  },
};

export const Stopped: Story = {
  args: {
    idleState: "stopped",
    onResume: () => console.log("Resume clicked"),
  },
};
