import type { Meta, StoryObj } from "@storybook/react";
import Header from "../src/app/components/header";

const meta = {
  title: "Example/Header",
  component: Header,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
