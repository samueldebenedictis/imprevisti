import type React from "react";
import { useState } from "react";
import {
  MODAL_SPECIAL_EFFECT_INFO_BACKWRITE,
  MODAL_SPECIAL_EFFECT_INFO_BATTLE,
  MODAL_SPECIAL_EFFECT_INFO_DICTATION_DRAW,
  MODAL_SPECIAL_EFFECT_INFO_FACE_EMOTION,
  MODAL_SPECIAL_EFFECT_INFO_MIME,
  MODAL_SPECIAL_EFFECT_INFO_MOVE,
  MODAL_SPECIAL_EFFECT_INFO_MUSIC_EMOTION,
  MODAL_SPECIAL_EFFECT_INFO_PHYSICAL_TEST,
  MODAL_SPECIAL_EFFECT_INFO_QUIZ,
  MODAL_SPECIAL_EFFECT_INFO_WHAT_WOULD_YOU_DO,
} from "../../texts";

interface SpecialEffectInfoIconProps {
  actionType: string | null;
}

const SpecialEffectInfoIcon: React.FC<SpecialEffectInfoIconProps> = ({
  actionType,
}) => {
  const [showInfo, setShowInfo] = useState(false);

  const getSpecialEffectInfo = (actionType: string | null) => {
    switch (actionType) {
      case "battle":
        return MODAL_SPECIAL_EFFECT_INFO_BATTLE;
      case "mime":
        return MODAL_SPECIAL_EFFECT_INFO_MIME;
      case "quiz":
        return MODAL_SPECIAL_EFFECT_INFO_QUIZ;
      case "backwrite":
        return MODAL_SPECIAL_EFFECT_INFO_BACKWRITE;
      case "dictation-draw":
        return MODAL_SPECIAL_EFFECT_INFO_DICTATION_DRAW;
      case "music-emotion":
        return MODAL_SPECIAL_EFFECT_INFO_MUSIC_EMOTION;
      case "physical-test":
        return MODAL_SPECIAL_EFFECT_INFO_PHYSICAL_TEST;
      case "what-would-you-do":
        return MODAL_SPECIAL_EFFECT_INFO_WHAT_WOULD_YOU_DO;
      case "face-emotion":
        return MODAL_SPECIAL_EFFECT_INFO_FACE_EMOTION;
      default:
        return MODAL_SPECIAL_EFFECT_INFO_MOVE;
    }
  };

  return (
    <>
      <div className="absolute top-0 right-0">
        <button
          onMouseEnter={() => setShowInfo(true)}
          onMouseLeave={() => setShowInfo(false)}
          className="text-gray-600 hover:text-gray-800"
          type="button"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            role="img"
            aria-label="Informazioni effetto speciale"
          >
            <title>Informazioni effetto speciale</title>
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <path d="M12 17h.01" />
          </svg>
        </button>
      </div>
      {showInfo && (
        <div className="ui-border-dark -translate-x-1/2 absolute bottom-10 left-1/2 z-10 min-w-[500px] bg-white p-4 text-xl shadow-lg">
          {getSpecialEffectInfo(actionType)}
        </div>
      )}
    </>
  );
};

export default SpecialEffectInfoIcon;
