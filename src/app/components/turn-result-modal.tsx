import type React from "react";
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
  if (!isOpen) {
    return null;
  }

  return (
    <div className=" ui-text-dark fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="ui-border-dark min-w-[600px] bg-white p-6 text-center shadow-lg">
        <h2 className=" ui-text-title mb-4">{MODAL_TITLE_TURN_RESULT}</h2>

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
