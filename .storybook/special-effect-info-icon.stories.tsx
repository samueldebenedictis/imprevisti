import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "storybook/test";
import SpecialEffectInfoIcon from "../src/app/components/turn-result-modal/special-effect-info-icon";

const meta = {
  title: "SpecialSquares/SpecialEffectInfoIcon",
  component: SpecialEffectInfoIcon,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    actionType: {
      control: { type: "select" },
      options: [
        "battle",
        "mime",
        "quiz",
        "backwrite",
        "dictation-draw",
        "music-emotion",
        "physical-test",
        "what-would-you-do",
        "face-emotion",
        null,
      ],
    },
  },
  decorators: [
    (Story) => (
      <div className="relative h-32 w-64">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SpecialEffectInfoIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

const hoverIcon = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  const button = canvas.getByRole("button");
  await userEvent.hover(button);
  await expect(button).toBeInTheDocument();
};

export const Quiz: Story = {
  args: { actionType: "quiz" },
  play: hoverIcon,
};

export const Battle: Story = {
  args: { actionType: "battle" },
  play: hoverIcon,
};

export const Mime: Story = {
  args: { actionType: "mime" },
  play: hoverIcon,
};

export const BackWrite: Story = {
  args: { actionType: "backwrite" },
  play: hoverIcon,
};

export const DictationDraw: Story = {
  args: { actionType: "dictation-draw" },
  play: hoverIcon,
};

export const MusicEmotion: Story = {
  args: { actionType: "music-emotion" },
  play: hoverIcon,
};

export const PhysicalTest: Story = {
  args: { actionType: "physical-test" },
  play: hoverIcon,
};

export const WhatWouldYouDo: Story = {
  args: { actionType: "what-would-you-do" },
  play: hoverIcon,
};

export const FaceEmotion: Story = {
  args: { actionType: "face-emotion" },
  play: hoverIcon,
};

export const MoveDefault: Story = {
  args: { actionType: null },
  play: hoverIcon,
};
