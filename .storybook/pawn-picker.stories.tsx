import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import PawnPicker from "../src/app/components/pawn-picker";
import { defaultPawn, type PawnStyle } from "../src/model/pawn";

const meta = {
  title: "Example/PawnPicker",
  component: PawnPicker,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof PawnPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Scelta interattiva: l'anteprima segue colore e forma scelti. */
export const Default: Story = {
  args: { name: "Luca", value: defaultPawn(0), onChange: () => {} },
  render: (args) => {
    const [pawn, setPawn] = useState<PawnStyle>(args.value);
    return <PawnPicker name={args.name} value={pawn} onChange={setPawn} />;
  },
};

export const Hexagon: Story = {
  args: {
    name: "Anna",
    value: { color: "pink", shape: "hexagon" },
    onChange: () => {},
  },
};
