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

export const YellowButton: Story = {
  args: {
    children: "Yellow Button",
    color: "yellow",
  },
};

export const GreenButton: Story = {
  args: {
    children: "Green Button",
    color: "green",
  },
};

export const RedButton: Story = {
  args: {
    children: "Red Button",
    color: "red",
  },
};

export const PurpleButton: Story = {
  args: {
    children: "Purple Button",
    color: "purple",
  },
};

export const BlackButton: Story = {
  args: {
    children: "Black Button",
    color: "black",
  },
};

export const Disabled: Story = {
  args: {
    children: "Disabled Button",
    color: "green",
    disabled: true,
  },
};

export const WithCustomClass: Story = {
  args: {
    children: "Custom Styled Button",
    color: "blue",
    className: "w-64 h-12 text-lg",
  },
};
