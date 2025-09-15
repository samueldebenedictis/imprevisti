import type React from "react";
import type { WhatWouldYouDo } from "@/model/deck";
import Button from "../ui/button";

interface WhatWouldYouDoResultProps {
  actionData: WhatWouldYouDo;
  onResolveWhatWouldYouDo?: (success: boolean) => void;
  onClose: () => void;
}

const H3 = (props: { children: string }) => (
  <h3 className="ui-text-dark ui-text-subtitle">{props.children}</h3>
);

const WhatWouldYouDoResult: React.FC<WhatWouldYouDoResultProps> = ({
  actionData,
  onResolveWhatWouldYouDo,
  onClose,
}) => {
  return (
    <div className="mt-4">
      <H3>Cosa Faresti Se</H3>
      <p className="mb-1 text-xl">
        Domanda:{" "}
        <span className="font-bold">{actionData.cardQuestion.cardTitle}</span>
      </p>
      <div className="mt-2 flex justify-center space-x-4">
        <Button
          onClick={() => {
            if (onResolveWhatWouldYouDo) {
              onResolveWhatWouldYouDo(true);
            }
            onClose();
          }}
          color="green"
        >
          Risposta Convincente
        </Button>
        <Button
          onClick={() => {
            if (onResolveWhatWouldYouDo) {
              onResolveWhatWouldYouDo(false);
            }
            onClose();
          }}
          color="red"
        >
          Risposta Non Convincente
        </Button>
      </div>
    </div>
  );
};

export default WhatWouldYouDoResult;
