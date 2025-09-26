import type React from "react";
import { useState } from "react";
import type { Battle } from "@/model/battle";
import type {
  BackWrite,
  DictationDraw,
  FaceEmotion,
  Mime,
  MusicEmotion,
  PhysicalTest,
  Quiz,
  WhatWouldYouDo,
} from "@/model/deck";
import type { Player } from "@/model/player";
import {
  MODAL_CLOSE_BUTTON,
  MODAL_DICE_ROLL_MESSAGE,
  MODAL_NEW_POSITION,
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
  MODAL_TITLE_TURN_RESULT,
} from "../texts";
import BackWriteResult from "./turn-result-modal/back-write-result";
import BattleResult from "./turn-result-modal/battle-result";
import DictationDrawResult from "./turn-result-modal/dictation-draw-result";
import FaceEmotionResult from "./turn-result-modal/face-emotion-result";
import MimeResult from "./turn-result-modal/mime-result";
import MusicEmotionResult from "./turn-result-modal/music-emotion-result";
import PhysicalTestResult from "./turn-result-modal/physical-test-result";
import QuizResult from "./turn-result-modal/quiz-result";
import SpecialEffect from "./turn-result-modal/special-effect";
import WhatWouldYouDoResult from "./turn-result-modal/what-would-you-do-result";
import Button from "./ui/button";
import { Divider } from "./ui/divider";

interface DiceResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  diceResult: number;
  actionType: string | null;
  actionData:
    | Battle
    | Mime
    | Quiz
    | BackWrite
    | FaceEmotion
    | MusicEmotion
    | PhysicalTest
    | WhatWouldYouDo
    | DictationDraw
    | null;
  onResolveBattle?: (winnerId: number) => void;
  onResolveMime?: (success: boolean, guessPlayerId?: number) => void;
  onResolveQuiz?: (success: boolean) => void;
  onResolveBackWrite?: (success: boolean, guessPlayerId?: number) => void;
  onResolveFaceEmotion?: (success: boolean) => void;
  onResolveMusicEmotion?: (success: boolean) => void;
  onResolvePhysicalTest?: (success: boolean) => void;
  onResolveWhatWouldYouDo?: (success: boolean) => void;
  onResolveDictationDraw?: (success: boolean, drawingPlayerId?: number) => void;
  allPlayers: Player[];
  currentPlayerName: string;
  startPosition?: number;
  newPosition?: number;
  boardSize?: number;
}

const DiceResultModal: React.FC<DiceResultModalProps> = ({
  isOpen,
  onClose,
  diceResult,
  actionType,
  actionData,
  onResolveBattle,
  onResolveMime,
  onResolveQuiz,
  onResolveBackWrite,
  onResolveFaceEmotion,
  onResolveMusicEmotion,
  onResolvePhysicalTest,
  onResolveWhatWouldYouDo,
  onResolveDictationDraw,
  allPlayers,
  currentPlayerName,
  startPosition,
  newPosition,
  boardSize,
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

  if (!isOpen) {
    return null;
  }

  return (
    <div className="ui-text-dark fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="ui-border-dark min-w-[600px] bg-white p-6 text-center shadow-lg">
        <div className="relative mb-4">
          <h2 className="ui-text-title text-center">
            {MODAL_TITLE_TURN_RESULT}
          </h2>
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
            {showInfo && (
              <div className="ui-border-dark absolute right-full bottom-8 z-10 mr-2 w-120 bg-white p-2 text-xl shadow-lg">
                {getSpecialEffectInfo(actionType)}
              </div>
            )}
          </div>
        </div>

        {diceResult !== null && !(diceResult === 0 && actionType === null) && (
          <p className="mb-1 text-xl">
            <span className="font-extrabold text-blue-600">
              {currentPlayerName}
            </span>{" "}
            {MODAL_DICE_ROLL_MESSAGE}
            <span className="font-extrabold text-blue-600">
              {diceResult}
            </span>{" "}
          </p>
        )}

        {newPosition !== undefined &&
          startPosition !== undefined &&
          !(diceResult === 0 && actionType === null) && (
            <p className="mb-1 text-xl">
              {MODAL_NEW_POSITION}{" "}
              <span className="font-extrabold text-blue-600">
                {newPosition}
              </span>
            </p>
          )}

        <SpecialEffect
          diceResult={diceResult}
          newPosition={newPosition}
          startPosition={startPosition}
          boardSize={boardSize}
        />

        {actionType && <Divider />}

        {actionType === "battle" &&
          actionData &&
          (actionData as Battle).getPlayers && (
            <BattleResult
              actionData={actionData as Battle}
              onResolveBattle={onResolveBattle}
              onClose={onClose}
              allPlayers={allPlayers}
            />
          )}

        {actionType === "quiz" &&
          actionData &&
          (actionData as Quiz).cardTopic && (
            <QuizResult
              actionData={actionData as Quiz}
              onResolveQuiz={onResolveQuiz}
              onClose={onClose}
            />
          )}

        {actionType === "mime" &&
          actionData &&
          (actionData as Mime).cardTopic && (
            <MimeResult
              isOpen={isOpen}
              actionData={actionData as Mime}
              onResolveMime={onResolveMime}
              onClose={onClose}
              allPlayers={allPlayers}
            />
          )}

        {actionType === "backwrite" &&
          actionData &&
          (actionData as BackWrite).cardTopic && (
            <BackWriteResult
              isOpen={isOpen}
              actionData={actionData as BackWrite}
              onResolveBackWrite={onResolveBackWrite}
              onClose={onClose}
              allPlayers={allPlayers}
            />
          )}

        {actionType === "face-emotion" &&
          actionData &&
          (actionData as FaceEmotion).cardEmotion && (
            <FaceEmotionResult
              actionData={actionData as FaceEmotion}
              onResolveFaceEmotion={onResolveFaceEmotion}
              onClose={onClose}
            />
          )}

        {actionType === "music-emotion" &&
          actionData &&
          (actionData as MusicEmotion).cardEmotion && (
            <MusicEmotionResult
              actionData={actionData as MusicEmotion}
              onResolveMusicEmotion={onResolveMusicEmotion}
              onClose={onClose}
            />
          )}

        {actionType === "physical-test" &&
          actionData &&
          (actionData as PhysicalTest).cardTest && (
            <PhysicalTestResult
              actionData={actionData as PhysicalTest}
              onResolvePhysicalTest={onResolvePhysicalTest}
              onClose={onClose}
            />
          )}

        {actionType === "what-would-you-do" &&
          actionData &&
          (actionData as WhatWouldYouDo).cardQuestion && (
            <WhatWouldYouDoResult
              actionData={actionData as WhatWouldYouDo}
              onResolveWhatWouldYouDo={onResolveWhatWouldYouDo}
              onClose={onClose}
            />
          )}

        {actionType === "dictation-draw" &&
          actionData &&
          (actionData as DictationDraw).cardTopic && (
            <DictationDrawResult
              isOpen={isOpen}
              actionData={actionData as DictationDraw}
              onResolveDictationDraw={onResolveDictationDraw}
              onClose={onClose}
              allPlayers={allPlayers}
            />
          )}

        <Divider />
        <Button onClick={onClose} color="blue" className="mx-auto">
          {MODAL_CLOSE_BUTTON}
        </Button>
      </div>
    </div>
  );
};

export default DiceResultModal;
