import type React from "react";
import type { WhatWouldYouDo } from "@/model/deck";
import {
  MODAL_WHAT_WOULD_YOU_DO_CONVINCING_ANSWER,
  MODAL_WHAT_WOULD_YOU_DO_NOT_CONVINCING_ANSWER,
  MODAL_WHAT_WOULD_YOU_DO_QUESTION,
  MODAL_WHAT_WOULD_YOU_DO_TITLE,
} from "../../texts";
import Button from "../ui/button";
import { H3 } from "./h3";

interface WhatWouldYouDoResultProps {
  actionData: WhatWouldYouDo;
  onResolveWhatWouldYouDo?: (success: boolean) => void;
  onClose: () => void;
}

const WhatWouldYouDoResult: React.FC<WhatWouldYouDoResultProps> = ({
  actionData,
  onResolveWhatWouldYouDo,
  onClose,
}) => {
  return (
    <div className="mt-4">
      <H3>{MODAL_WHAT_WOULD_YOU_DO_TITLE}</H3>
      <p className="mb-1 text-xl">
        {MODAL_WHAT_WOULD_YOU_DO_QUESTION}{" "}
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
          {MODAL_WHAT_WOULD_YOU_DO_CONVINCING_ANSWER}
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
          {MODAL_WHAT_WOULD_YOU_DO_NOT_CONVINCING_ANSWER}
        </Button>
      </div>
    </div>
  );
};

export default WhatWouldYouDoResult;
