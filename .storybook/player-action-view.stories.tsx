import type { Meta, StoryObj } from "@storybook/react";
import PlayerActionView from "../src/app/components/player-action-view";

const meta = {
  title: "SpecialSquares/PlayerDevice/PlayerActionView",
  component: PlayerActionView,
  parameters: {
    layout: "fullscreen",
  },
  globals: {
    viewport: { value: "mobile2", isRotated: false },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof PlayerActionView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TargetSelectionBackwrite: Story = {
  args: {
    phase: "target-selection",
    otherPlayers: [
      { id: "2", name: "Giocatore 2" },
      { id: "3", name: "Giocatore 3" },
    ],
    onSelectTarget: (targetId) => console.log(`Target selected: ${targetId}`),
  },
};

export const QuizActor: Story = {
  args: {
    phase: "quiz-actor",
    quizQuestion: "Qual è la capitale dell'Italia?",
  },
};

export const MimeActor: Story = {
  args: {
    phase: "actor",
    actionType: "mime",
    card: { cardTitle: "Elefante", cardText: "" },
  },
};

export const BackWriteActor: Story = {
  args: {
    phase: "actor",
    actionType: "backwrite",
    card: { cardTitle: "Gatto", cardText: "" },
  },
};

export const FaceEmotionActor: Story = {
  args: {
    phase: "actor",
    actionType: "face-emotion",
    // Forma reale inviata dal server (roll/route.ts): il campo immagine sta
    // fuori, il testo della carta è annidato sotto "topic" — getCardDisplay
    // (card-utils.ts) legge imageUrl solo in questa forma.
    card: {
      topic: { cardTitle: "felice", cardText: "felice" },
      imageUrl: "/images/face-emotion/uomo-1-felice.png",
    },
  },
};

export const MusicEmotionActor: Story = {
  args: {
    phase: "actor",
    actionType: "music-emotion",
    card: { cardTitle: "Felicità", cardText: "Canta una canzone allegra" },
  },
};

export const PhysicalTestActor: Story = {
  args: {
    phase: "actor",
    actionType: "physical-test",
    card: { cardTitle: "Test fisico", cardText: "Fai 10 flessioni" },
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
  },
};

export const DictationDrawActor: Story = {
  args: {
    phase: "actor",
    actionType: "dictation-draw",
    card: {
      topic: {
        cardTitle: "Casa: Una semplice casa con tetto e porta 🏠",
        cardText: "",
      },
      imageUrl: "/images/dictation-draw/house.svg",
    },
  },
};

export const BattleActor: Story = {
  args: {
    phase: "actor",
    actionType: "battle",
    card: null,
  },
};

export const BackWriteTarget: Story = {
  args: {
    phase: "target",
    actionType: "backwrite",
  },
};

export const DictationDrawTarget: Story = {
  args: {
    phase: "target",
    actionType: "dictation-draw",
  },
};

export const Spectator: Story = {
  args: {
    phase: "spectator",
    actorName: "Giocatore 1",
  },
};
