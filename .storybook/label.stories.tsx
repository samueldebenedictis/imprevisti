import type { Meta, StoryObj } from "@storybook/react";
import { Label, LabelCheckbox } from "../src/app/components/ui/label";

const meta = {
  title: "UI/Label",
  component: Label,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    htmlFor: "numPlayers",
    children: "Numero di giocatori:",
  },
};

export const WithClassName: Story = {
  args: {
    htmlFor: "ageGroup",
    children: "Ruolo",
    className: "font-light",
  },
};

export const Checkbox: Story = {
  args: {
    htmlFor: "sound-toggle",
    children: "Suoni attivati",
  },
  render: (args) => (
    <div className="flex items-center gap-2">
      <input type="checkbox" id={args.htmlFor} defaultChecked />
      <LabelCheckbox htmlFor={args.htmlFor}>{args.children}</LabelCheckbox>
    </div>
  ),
};
