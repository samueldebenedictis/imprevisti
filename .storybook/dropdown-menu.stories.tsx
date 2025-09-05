import type { Meta, StoryObj } from "@storybook/react";
import DropdownMenu from "../src/app/components/ui/dropdown-menu";

const meta = {
  title: "Example/DropdownMenu",
  component: DropdownMenu,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof DropdownMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const InHeader: Story = {
  args: {},
  decorators: [
    (Story) => (
      <div className="bg-amber-500 p-4">
        <Story />
      </div>
    ),
  ],
};
