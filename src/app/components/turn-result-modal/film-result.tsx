import type React from "react";
import { useState } from "react";
import type { Film } from "@/model/deck";
import {
  MODAL_FILM_ANSWER,
  MODAL_FILM_CORRECT,
  MODAL_FILM_SHOW_ANSWER,
  MODAL_FILM_TITLE,
  MODAL_FILM_WRONG,
} from "../../texts";
import FilmVideo from "../film-video";
import Button from "../ui/button";
import { H3 } from "./h3";

interface FilmResultProps {
  actionData: Film;
  onResolveFilm?: (success: boolean) => void;
  onClose: () => void;
}

const FilmResult: React.FC<FilmResultProps> = ({
  actionData,
  onResolveFilm,
  onClose,
}) => {
  const [showEmotionAnswer, setShowEmotionAnswer] = useState(false);

  const handleFilmResolution = (success: boolean) => {
    if (onResolveFilm) {
      onResolveFilm(success);
    }
    setShowEmotionAnswer(false);
    onClose();
  };

  return (
    <div className="mt-4">
      <H3>{MODAL_FILM_TITLE}</H3>
      <div className="mb-4 flex justify-center">
        <FilmVideo
          videoUrl={actionData.videoUrl}
          title={actionData.cardEmotion.cardText}
        />
      </div>
      {!showEmotionAnswer && (
        <Button
          onClick={() => setShowEmotionAnswer(true)}
          color="purple"
          className="mx-auto"
        >
          {MODAL_FILM_SHOW_ANSWER}
        </Button>
      )}
      {showEmotionAnswer && (
        <>
          <p className="mb-1 text-xl">
            {MODAL_FILM_ANSWER}{" "}
            <span className="font-bold">
              {actionData.cardEmotion.cardTitle}
            </span>
          </p>
          <div className="flex justify-center space-x-4">
            <Button onClick={() => handleFilmResolution(true)} color="green">
              {MODAL_FILM_CORRECT}
            </Button>
            <Button onClick={() => handleFilmResolution(false)} color="red">
              {MODAL_FILM_WRONG}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default FilmResult;
