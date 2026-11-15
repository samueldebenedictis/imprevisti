import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import PawnPickerButton from "../src/app/components/pawn-picker-button";
import { defaultPawn, type PawnStyle } from "../src/model/pawn";

const meta = {
  title: "Example/PawnPickerButton",
  component: PawnPickerButton,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof PawnPickerButton>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Schermo singolo: cliccando l'anteprima si apre la finestra di scelta. */
export const Default: Story = {
  args: { name: "Luca", value: defaultPawn(0), onChange: () => {} },
  render: (args) => {
    const [pawn, setPawn] = useState<PawnStyle>(args.value);
    return (
      <PawnPickerButton name={args.name} value={pawn} onChange={setPawn} />
    );
  },
};

export const WithoutName: Story = {
  args: { name: "", value: defaultPawn(2), onChange: () => {} },
};
