import type React from "react";
import type { MusicEmotion } from "@/model/deck";
import Button from "../ui/button";

interface MusicEmotionResultProps {
  actionData: MusicEmotion;
  onResolveMusicEmotion?: (success: boolean) => void;
  onClose: () => void;
}

const H3 = (props: { children: string }) => (
  <h3 className="ui-text-dark ui-text-subtitle">{props.children}</h3>
);

const MusicEmotionResult: React.FC<MusicEmotionResultProps> = ({
  actionData,
  onResolveMusicEmotion,
  onClose,
}) => {
  return (
    <div className="mt-4">
      <H3>Musica Emozioni</H3>
      <p className="mb-1 text-xl">
        Emozione da esprimere con una canzone:{" "}
        <span className="font-bold">{actionData.cardEmotion.cardTitle}</span>
      </p>
      <div className="mt-2 flex justify-center space-x-4">
        <Button
          onClick={() => {
            if (onResolveMusicEmotion) {
              onResolveMusicEmotion(true);
            }
            onClose();
          }}
          color="green"
        >
          Emozione Indovinata
        </Button>
        <Button
          onClick={() => {
            if (onResolveMusicEmotion) {
              onResolveMusicEmotion(false);
            }
            onClose();
          }}
          color="red"
        >
          Emozione Non Indovinata
        </Button>
      </div>
    </div>
  );
};

export default MusicEmotionResult;
