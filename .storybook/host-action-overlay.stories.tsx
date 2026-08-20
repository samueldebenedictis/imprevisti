import type { Meta, StoryObj } from "@storybook/react";
import { userEvent, within } from "storybook/test";
import HostActionOverlay from "../src/app/components/host-action-overlay";

const meta = {
  title: "SpecialSquares/HostDevice/HostActionOverlay",
  component: HostActionOverlay,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof HostActionOverlay>;

export default meta;
type Story = StoryObj<typeof meta>;

const players = [
  { id: "1", name: "Alice" },
  { id: "2", name: "Bob" },
  { id: "3", name: "Carol" },
];

const baseArgs = {
  players,
  onResolve: (success: boolean) => console.log(`Resolved success: ${success}`),
  onResolveWithWinner: (winnerId: string) => console.log(`Winner: ${winnerId}`),
};

export const Quiz: Story = {
  args: {
    ...baseArgs,
    pendingAction: {
      type: "quiz",
      actorPlayerId: "1",
      card: {
        cardTitle: "Qual è la capitale dell'Italia?",
        cardText: "Roma",
      },
    },
  },
};

export const QuizAnswerRevealed: Story = {
  args: { ...Quiz.args },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText("Mostra risposta"));
  },
};

export const Mime: Story = {
  args: {
    ...baseArgs,
    pendingAction: {
      type: "mime",
      actorPlayerId: "1",
      card: { cardTitle: "Elefante", cardText: "" },
    },
  },
};

export const MimeSelectingWinner: Story = {
  args: { ...Mime.args },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText("Riuscito"));
  },
};

export const BackWriteAwaitingTarget: Story = {
  args: {
    ...baseArgs,
    pendingAction: {
      type: "backwrite",
      actorPlayerId: "1",
      card: { cardTitle: "Gatto", cardText: "" },
    },
  },
};

export const BackWriteWithTarget: Story = {
  args: {
    ...baseArgs,
    pendingAction: {
      type: "backwrite",
      actorPlayerId: "1",
      targetPlayerId: "2",
      card: { cardTitle: "Gatto", cardText: "" },
    },
  },
};

export const DictationDrawWithTarget: Story = {
  args: {
    ...baseArgs,
    pendingAction: {
      type: "dictation-draw",
      actorPlayerId: "1",
      targetPlayerId: "2",
      card: {
        cardTitle: "Casa: Una semplice casa con tetto e porta 🏠",
        cardText: "",
        imageUrl: "/images/dictation-draw/house.svg",
      },
    },
  },
};

export const FaceEmotion: Story = {
  args: {
    ...baseArgs,
    pendingAction: {
      type: "face-emotion",
      actorPlayerId: "1",
      card: {
        cardTitle: "felice",
        cardText: "felice",
        imageUrl: "/images/faces/140_y_f_h_a.jpg",
      },
    },
  },
};

export const MusicEmotion: Story = {
  args: {
    ...baseArgs,
    pendingAction: {
      type: "music-emotion",
      actorPlayerId: "1",
      card: { cardTitle: "Felicità", cardText: "Canta una canzone allegra" },
    },
  },
};

export const PhysicalTest: Story = {
  args: {
    ...baseArgs,
    pendingAction: {
      type: "physical-test",
      actorPlayerId: "1",
      card: { cardTitle: "Fai una flessione", cardText: "" },
    },
  },
};

export const WhatWouldYouDo: Story = {
  args: {
    ...baseArgs,
    pendingAction: {
      type: "what-would-you-do",
      actorPlayerId: "1",
      card: {
        cardTitle: "Se vincessi un viaggio intorno al mondo?",
        cardText: "",
      },
    },
  },
};
