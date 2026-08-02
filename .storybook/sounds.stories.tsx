import type { Meta, StoryObj } from "@storybook/react";
import Button from "../src/app/components/ui/button";
import { soundManager } from "../src/app/utils/sound-manager";

type SoundEffect = {
  label: string;
  color: "yellow" | "blue" | "green" | "red" | "purple" | "black";
  play: () => void;
};

const SOUND_EFFECTS: SoundEffect[] = [
  {
    label: "Click pulsante",
    color: "blue",
    play: () => soundManager.playButtonClick(),
  },
  {
    label: "Balzo pedina",
    color: "green",
    play: () => soundManager.playPawnMove(),
  },
  {
    label: "Lancio dado",
    color: "yellow",
    play: () => soundManager.playDiceRoll(),
  },
  {
    label: "Salto turno",
    color: "purple",
    play: () => soundManager.playTurnSkip(),
  },
  {
    label: "Casella speciale",
    color: "black",
    play: () => soundManager.playSpecialSquare(),
  },
  {
    label: "Battaglia",
    color: "red",
    play: () => soundManager.playBattle(),
  },
  {
    label: "Vittoria",
    color: "green",
    play: () => soundManager.playVictory(),
  },
];

function SoundsBoard() {
  return (
    <div className="flex flex-wrap gap-2">
      {SOUND_EFFECTS.map((effect) => (
        <Button key={effect.label} color={effect.color} onClick={effect.play}>
          {effect.label}
        </Button>
      ))}
    </div>
  );
}

const meta = {
  title: "UI/Sounds",
  component: SoundsBoard,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof SoundsBoard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllEffects: Story = {};
