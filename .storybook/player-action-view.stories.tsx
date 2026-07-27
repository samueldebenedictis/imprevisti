import type { Meta, StoryObj } from "@storybook/react";
import PlayerActionView from "../src/app/components/player-action-view";

const meta = {
  title: "SpecialSquares/PlayerDevice/PlayerActionView",
  component: PlayerActionView,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof PlayerActionView>;

export default meta;
type Story = StoryObj<typeof meta>;

const positions = [
  { id: "1", name: "Giocatore 1", position: 5 },
  { id: "2", name: "Giocatore 2", position: 3 },
  { id: "3", name: "Giocatore 3", position: 7 },
];

export const TargetSelectionBackwrite: Story = {
  args: {
    phase: "target-selection",
    otherPlayers: [
      { id: "2", name: "Giocatore 2" },
      { id: "3", name: "Giocatore 3" },
    ],
    onSelectTarget: (targetId) => console.log(`Target selected: ${targetId}`),
    positions,
    selfId: "1",
  },
};

export const QuizActor: Story = {
  args: {
    phase: "quiz-actor",
    quizQuestion: "Qual è la capitale dell'Italia?",
    positions,
    selfId: "1",
  },
};

export const MimeActor: Story = {
  args: {
    phase: "actor",
    actionType: "mime",
    card: { cardTitle: "Elefante", cardText: "" },
    positions,
    selfId: "1",
  },
};

export const BackWriteActor: Story = {
  args: {
    phase: "actor",
    actionType: "backwrite",
    card: { cardTitle: "Gatto", cardText: "" },
    positions,
    selfId: "1",
  },
};

export const FaceEmotionActor: Story = {
  args: {
    phase: "actor",
    actionType: "face-emotion",
    card: {
      cardTitle: "felice",
      cardText: "felice",
      imageUrl: "/images/face-emotion/uomo-1-felice.png",
    },
    positions,
    selfId: "1",
  },
};

export const MusicEmotionActor: Story = {
  args: {
    phase: "actor",
    actionType: "music-emotion",
    card: { cardTitle: "Felicità", cardText: "Canta una canzone allegra" },
    positions,
    selfId: "1",
  },
};

export const PhysicalTestActor: Story = {
  args: {
    phase: "actor",
    actionType: "physical-test",
    card: { cardTitle: "Test fisico", cardText: "Fai 10 flessioni" },
    positions,
    selfId: "1",
  },
};

export const WhatWouldYouDoActor: Story = {
  args: {
    phase: "actor",
    actionType: "what-would-you-do",
    card: {
      cardTitle: "Situazione ipotetica",
      cardText: "Se vincessi un viaggio intorno al mondo?",
    },
    positions,
    selfId: "1",
  },
};

export const DictationDrawActor: Story = {
  args: {
    phase: "actor",
    actionType: "dictation-draw",
    card: {
      cardTitle: "Casa: Una semplice casa con tetto e porta 🏠",
      cardText: "",
      imageUrl: "/images/dictation-draw/house.svg",
    },
    positions,
    selfId: "1",
  },
};

export const BattleActor: Story = {
  args: {
    phase: "actor",
    actionType: "battle",
    card: null,
    positions,
    selfId: "1",
  },
};

export const BackWriteTarget: Story = {
  args: {
    phase: "target",
    actionType: "backwrite",
    positions,
    selfId: "2",
  },
};

export const DictationDrawTarget: Story = {
  args: {
    phase: "target",
    actionType: "dictation-draw",
    positions,
    selfId: "2",
  },
};

export const QuizTarget: Story = {
  args: {
    phase: "target",
    actionType: "quiz",
    positions,
    selfId: "2",
  },
};

export const Spectator: Story = {
  args: {
    phase: "spectator",
    actorName: "Giocatore 1",
    positions,
    selfId: "3",
  },
};
