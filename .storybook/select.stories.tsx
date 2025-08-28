import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import Select from "../src/app/components/ui/select";

const meta = {
  title: "UI/Select",
  component: Select,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    onChange: { action: "changed" },
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

const options = [
  { value: "option1", label: "Option 1" },
  { value: "option2", label: "Option 2" },
  { value: "option3", label: "Option 3" },
];

export const Default: Story = {
  args: {
    value: "option1",
    onChange: () => {},
    options: options,
  },
};

export const ControlledSelect: Story = {
  render: (args) => {
    const [selectedValue, setSelectedValue] = useState("option2");
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedValue(e.target.value);
      args.onChange(e);
    };
    return <Select {...args} value={selectedValue} onChange={handleChange} />;
  },
  args: {
    value: "", // Dummy value for Storybook args
    onChange: () => {}, // Dummy onChange for Storybook args
    options: options,
  },
};
