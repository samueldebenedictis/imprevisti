import {
  LABEL_BACKWRITE,
  LABEL_BATTLE,
  LABEL_DICTATION_DRAW,
  LABEL_FACE_EMOTION,
  LABEL_MIME,
  LABEL_MUSIC_EMOTION,
  LABEL_PHYSICAL_TEST,
  LABEL_QUIZ,
  LABEL_WHAT_WOULD_YOU_DO,
} from "@/app/texts";

export const ACTION_LABELS: Record<string, string> = {
  quiz: LABEL_QUIZ,
  mime: LABEL_MIME,
  backwrite: LABEL_BACKWRITE,
  "face-emotion": LABEL_FACE_EMOTION,
  "music-emotion": LABEL_MUSIC_EMOTION,
  "physical-test": LABEL_PHYSICAL_TEST,
  "what-would-you-do": LABEL_WHAT_WOULD_YOU_DO,
  "dictation-draw": LABEL_DICTATION_DRAW,
  battle: LABEL_BATTLE,
};
