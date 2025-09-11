import type { Meta, StoryObj } from "@storybook/react";
import Menu from "../src/app/components/menu";

const meta = {
  title: "Example/Menu",
  component: Menu,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Menu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const InHeader: Story = {
  args: {},
  decorators: [
    (Story) => (
      <div className="bg-blue-500 p-4">
        <Story />
      </div>
    ),
  ],
};
