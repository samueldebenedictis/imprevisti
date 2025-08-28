import type { Meta, StoryObj } from "@storybook/react";
import Button from "../src/app/components/ui/button";

const meta = {
  title: "UI/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    color: {
      control: { type: "select" },
      options: ["yellow", "blue", "green", "red", "purple", "black"],
    },
    onClick: { action: "clicked" },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Blue Button",
    color: "blue",
  },
};

export const RedButton: Story = {
  args: {
    children: "Red Button",
    color: "red",
  },
};

export const Disabled: Story = {
  args: {
    children: "Disabled Button",
    color: "green",
    disabled: true,
  },
};
