import type React from "react";
import { useState } from "react";
import type { Quiz } from "@/model/deck";
import {
  MODAL_QUIZ_ANSWER,
  MODAL_QUIZ_CORRECT,
  MODAL_QUIZ_QUESTION,
  MODAL_QUIZ_SHOW_ANSWER,
  MODAL_QUIZ_TITLE,
  MODAL_QUIZ_WRONG,
} from "../../texts";
import Button from "../ui/button";
import { H3 } from "./h3";

interface QuizResultProps {
  actionData: Quiz;
  onResolveQuiz?: (success: boolean) => void;
  onClose: () => void;
}

const QuizResult: React.FC<QuizResultProps> = ({
  actionData,
  onResolveQuiz,
  onClose,
}) => {
  const [showQuizAnswer, setShowQuizAnswer] = useState(false);

  const handleShowQuizAnswer = () => {
    setShowQuizAnswer(true);
  };

  const handleQuizResolution = (success: boolean) => {
    if (onResolveQuiz) {
      onResolveQuiz(success);
    }
    setShowQuizAnswer(false);
    onClose();
  };

  return (
    <div className="mt-4">
      <H3>{MODAL_QUIZ_TITLE}</H3>
      <p className="m-1 text-xl">
        {MODAL_QUIZ_QUESTION}{" "}
        <span className="font-bold">{actionData.cardTopic.cardTitle}</span>
      </p>
      {!showQuizAnswer && (
        <Button
          onClick={handleShowQuizAnswer}
          color="purple"
          className="mx-auto"
        >
          {MODAL_QUIZ_SHOW_ANSWER}
        </Button>
      )}
      {showQuizAnswer && (
        <>
          <p className="mb-1 text-xl">
            <span className="font-bold">{MODAL_QUIZ_ANSWER} </span>
            {actionData.cardTopic.cardText}
          </p>
          <div className="flex justify-center space-x-4">
            <Button onClick={() => handleQuizResolution(true)} color="green">
              {MODAL_QUIZ_CORRECT}
            </Button>
            <Button onClick={() => handleQuizResolution(false)} color="red">
              {MODAL_QUIZ_WRONG}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default QuizResult;
