import type { Meta, StoryObj } from "@storybook/react";
import TurnResultModal from "../src/app/components/turn-result-modal";
import { Battle } from "../src/model/battle";
import {
  BackWrite,
  Card,
  DictationDraw,
  FaceEmotion,
  Film,
  Mime,
  MusicEmotion,
  PhysicalTest,
  Quiz,
  WhatWouldYouDo,
} from "../src/model/deck";
import { faceEmotionStorybookCards } from "../src/model/deck/face-emotion";
import { filmCards } from "../src/model/deck/film";
import { Player } from "../src/model/player";

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
        "film",
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
  new Player(1, "Alice"),
  new Player(2, "Bob"),
  new Player(3, "Carol"),
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
    actionData: new Battle(allPlayers[0], allPlayers[1]),
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
    actionData: new Quiz(
      allPlayers[0],
      new Card("Qual è la capitale dell'Italia?", "Roma"),
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
    actionData: new Mime(allPlayers[0], new Card("Elefante 🐘", "")),
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

const getFaceEmotionCard = (title: string) =>
  faceEmotionStorybookCards.find((el) => el.title === title) as {
    title: string;
    imageUrl: string;
    emotion: string;
  };

const makeFaceEmotionScenario = (title: string): Story["args"] => {
  const faceEmotionCard = getFaceEmotionCard(title);
  return {
    isOpen: true,
    onClose: () => console.log("Close modal"),
    diceResult: 2,
    actionType: "face-emotion",
    actionData: new FaceEmotion(
      allPlayers[0],
      new Card(faceEmotionCard.emotion, faceEmotionCard.title),
      faceEmotionCard.imageUrl,
    ),
    onResolveFaceEmotion: (success) =>
      console.log(`Face emotion success: ${success}`),
    allPlayers: allPlayers,
    currentPlayerName: allPlayers[0].getName(),
  };
};

export const FaceEmotionScenario: Story = {
  args: makeFaceEmotionScenario("donna-giovane-felicità-a"),
};

export const FaceEmotionAngerScenario: Story = {
  args: makeFaceEmotionScenario("uomo-adulto-rabbia-a"),
};

export const FaceEmotionSadnessScenario: Story = {
  args: makeFaceEmotionScenario("donna-anziana-tristezza-a"),
};

export const FaceEmotionFearScenario: Story = {
  args: makeFaceEmotionScenario("uomo-giovane-paura-a"),
};

export const FaceEmotionDisgustScenario: Story = {
  args: makeFaceEmotionScenario("donna-adulta-disgusto-a"),
};

export const FaceEmotionNeutralScenario: Story = {
  args: makeFaceEmotionScenario("uomo-anziano-neutralità-a"),
};

const makeFilmScenario = (title: string): Story["args"] => {
  const filmCard = filmCards.find((el) => el.title === title) as {
    title: string;
    videoUrl: string;
    emotion: string;
  };
  return {
    isOpen: true,
    onClose: () => console.log("Close modal"),
    diceResult: 2,
    actionType: "film",
    actionData: new Film(
      allPlayers[0],
      new Card(filmCard.emotion, filmCard.title),
      filmCard.videoUrl,
    ),
    onResolveFilm: (success) => console.log(`Film success: ${success}`),
    allPlayers: allPlayers,
    currentPlayerName: allPlayers[0].getName(),
  };
};

export const FilmScenario: Story = {
  args: makeFilmScenario("scena-felicita"),
};

export const FilmAngerScenario: Story = {
  args: makeFilmScenario("scena-rabbia"),
};

export const FilmSadnessScenario: Story = {
  args: makeFilmScenario("scena-tristezza"),
};

export const FilmFearScenario: Story = {
  args: makeFilmScenario("scena-paura"),
};

export const FilmDisgustScenario: Story = {
  args: makeFilmScenario("scena-disgusto"),
};

export const BackWriteScenario: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log("Close modal"),
    diceResult: 3,
    actionType: "backwrite",
    actionData: new BackWrite(allPlayers[0], new Card("Gatto", "")),
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
    actionData: new MusicEmotion(
      allPlayers[0],
      new Card("Felicità", "Canta una canzone allegra"),
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
    actionData: new PhysicalTest(
      allPlayers[0],
      new Card("Fai una flessione", ""),
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
    actionData: new WhatWouldYouDo(
      allPlayers[0],
      new Card("Se vincessi un viaggio intorno al mondo?", ""),
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
    actionData: new DictationDraw(
      allPlayers[0],
      new Card("Casa: Una semplice casa con tetto e porta 🏠", ""),
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
