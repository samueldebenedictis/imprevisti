import type { Meta, StoryObj } from "@storybook/react";
import TurnResultModal from "../src/app/components/turn-result-modal";
import { Battle } from "../src/model/battle";
import {
  BackWrite,
  Card,
  DictationDraw,
  FaceEmotion,
  Mime,
  MusicEmotion,
  PhysicalTest,
  Quiz,
  WhatWouldYouDo,
} from "../src/model/deck";
import { Player } from "../src/model/player";

// Mock classes
class MockPlayer extends Player {}
class MockBattle extends Battle {}
class MockCard extends Card {}
class MockQuiz extends Quiz {}
class MockMime extends Mime {}
class MockMusicEmotion extends MusicEmotion {}
class MockPhysicalTest extends PhysicalTest {}
class MockWhatWouldYouDo extends WhatWouldYouDo {}
class MockDictationDraw extends DictationDraw {}
class MockBackWrite extends BackWrite {}
class MockFaceEmotion extends FaceEmotion {}

const meta = {
  title: "Example/TurnResultModal",
  component: TurnResultModal,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  argTypes: {
    actionType: {
      control: { type: "select" },
      options: [
        "battle",
        "quiz",
        "mime",
        "backwrite",
        "face-emotion",
        "music-emotion",
        "physical-test",
        "what-would-you-do",
        "dictation-draw",
        null,
      ],
    },
  },
} satisfies Meta<typeof TurnResultModal>;

export default meta;
type Story = StoryObj<typeof meta>;

const allPlayers = [
  new MockPlayer(1, "Giocatore 1"),
  new MockPlayer(2, "Giocatore 2"),
  new MockPlayer(3, "Giocatore 3"),
];

export const Default: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log("Close modal"),
    diceResult: 5,
    actionType: null,
    actionData: null,
    allPlayers: allPlayers,
    currentPlayerName: allPlayers[0].getName(),
  },
};

export const BattleScenario: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log("Close modal"),
    diceResult: 3,
    actionType: "battle",
    actionData: new MockBattle(allPlayers[0], allPlayers[1]),
    onResolveBattle: (winnerId) => console.log(`Battle winner: ${winnerId}`),
    allPlayers: allPlayers,
    currentPlayerName: allPlayers[0].getName(),
  },
};

export const QuizScenario: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log("Close modal"),
    diceResult: 2,
    actionType: "quiz",
    actionData: new MockQuiz(
      allPlayers[0],
      new MockCard("Qual è la capitale dell'Italia?", "Roma"),
    ),
    onResolveQuiz: (success) => console.log(`Quiz success: ${success}`),
    allPlayers: allPlayers,
    currentPlayerName: allPlayers[0].getName(),
  },
};

export const MimeScenario: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log("Close modal"),
    diceResult: 1,
    actionType: "mime",
    actionData: new MockMime(
      allPlayers[0],
      new MockCard("Titolo mimo", "Mimo"),
    ),
    onResolveMime: (success, guesserId) =>
      console.log(`Mime success: ${success}, Guesser: ${guesserId}`),
    allPlayers: allPlayers,
    currentPlayerName: allPlayers[0].getName(),
  },
};

export const PositionChange: Story = {
  args: {
    ...Default.args,
    startPosition: 5,
    newPosition: 10,
    diceResult: 5,
  },
};

export const SpecialEffect: Story = {
  args: {
    ...Default.args,
    startPosition: 5,
    newPosition: 2,
    diceResult: 2,
    boardSize: 20,
  },
};

export const PositionChangeWithSpecialEffect: Story = {
  args: {
    ...Default.args,
    startPosition: 5,
    newPosition: 12,
    diceResult: 4,
    boardSize: 20,
  },
};

export const FaceEmotionScenario: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log("Close modal"),
    diceResult: 2,
    actionType: "face-emotion",
    actionData: new MockFaceEmotion(
      allPlayers[0],
      new MockCard("felice", "felice"),
      "/images/face-emotion/uomo-1-felice.png",
    ),
    onResolveFaceEmotion: (success) =>
      console.log(`Face emotion success: ${success}`),
    allPlayers: allPlayers,
    currentPlayerName: allPlayers[0].getName(),
  },
};

export const BackWriteScenario: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log("Close modal"),
    diceResult: 3,
    actionType: "backwrite",
    actionData: new MockBackWrite(allPlayers[0], new MockCard("Gatto", "")),
    onResolveBackWrite: (success, guessPlayerId) =>
      console.log(
        `Back write success: ${success}, Guess player: ${guessPlayerId}`,
      ),
    allPlayers: allPlayers,
    currentPlayerName: allPlayers[0].getName(),
  },
};

export const MusicEmotionScenario: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log("Close modal"),
    diceResult: 4,
    actionType: "music-emotion",
    actionData: new MockMusicEmotion(
      allPlayers[0],
      new MockCard("Felicità", "Canta una canzone allegra"),
    ),
    onResolveMusicEmotion: (success) =>
      console.log(`Music emotion success: ${success}`),
    allPlayers: allPlayers,
    currentPlayerName: allPlayers[0].getName(),
  },
};

export const PhysicalTestScenario: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log("Close modal"),
    diceResult: 3,
    actionType: "physical-test",
    actionData: new MockPhysicalTest(
      allPlayers[0],
      new MockCard("Test fisico", "Fai 10 flessioni"),
    ),
    onResolvePhysicalTest: (success) =>
      console.log(`Physical test success: ${success}`),
    allPlayers: allPlayers,
    currentPlayerName: allPlayers[0].getName(),
  },
};

export const WhatWouldYouDoScenario: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log("Close modal"),
    diceResult: 6,
    actionType: "what-would-you-do",
    actionData: new MockWhatWouldYouDo(
      allPlayers[0],
      new MockCard(
        "Situazione ipotetica",
        "Se vincessi un viaggio intorno al mondo?",
      ),
    ),
    onResolveWhatWouldYouDo: (success) =>
      console.log(`What would you do success: ${success}`),
    allPlayers: allPlayers,
    currentPlayerName: allPlayers[0].getName(),
  },
};

export const DictationDrawScenario: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log("Close modal"),
    diceResult: 4,
    actionType: "dictation-draw",
    actionData: new MockDictationDraw(
      allPlayers[0],
      new MockCard("Casa: Una semplice casa con tetto e porta 🏠", ""),
      "/images/dictation-draw/house.svg",
    ),
    onResolveDictationDraw: (success, drawingPlayerId) =>
      console.log(
        `Dictation draw success: ${success}, Drawing player: ${drawingPlayerId}`,
      ),
    allPlayers: allPlayers,
    currentPlayerName: allPlayers[0].getName(),
  },
};
