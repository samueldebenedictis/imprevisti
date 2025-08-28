import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import Input from "../src/app/components/ui/input";

const meta = {
  title: "UI/Input",
  component: Input,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    onChange: { action: "changed" },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: "Hello",
    onChange: () => {},
    placeholder: "Enter text",
  },
};

export const NumberInput: Story = {
  args: {
    value: 123,
    onChange: () => {},
    type: "number",
    placeholder: "Enter a number",
  },
};

export const ControlledInput: Story = {
  render: (args) => {
    const [value, setValue] = useState("Initial Value");
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value);
      args.onChange(e);
    };
    return <Input {...args} value={value} onChange={handleChange} />;
  },
  args: {
    value: "",
    onChange: () => {},
    placeholder: "Type something...",
  },
};
