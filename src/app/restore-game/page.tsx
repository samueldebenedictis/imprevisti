"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useGameStore } from "../../store/game-store";
import { URL_GAME } from "../../vars";
import Button from "../components/ui/button";
import {
  LABEL_CONTINUE_GAME_BUTTON,
  LABEL_CONTINUE_GAME_TITLE,
  LABEL_INVALID_FILE,
  LABEL_LOAD_AND_RESUME,
  LABEL_NO_SAVE_NO_STORAGE,
  LABEL_RESTORE_GAME,
  LABEL_SELECT_FILE,
  LABEL_SELECT_FILE_PLEASE,
  LABEL_UPLOAD_FILE,
} from "../texts";

function Label(props: { children: string; htmlFor: string }) {
  return (
    <label htmlFor={props.htmlFor} className=" ui-text-subtitle">
      {props.children}
    </label>
  );
}

export default function RestoreGamePage() {
  const router = useRouter();

  // Selettori form
  const hasSavedGame = useGameStore((state) => state.hasSavedGame);
  const selectedFile = useGameStore((state) => state.selectedFile);
  const actions = useGameStore((state) => state.actions);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    actions.checkSavedGame();
  }, [actions]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0]) {
      actions.setSelectedFile(event.target.files[0]);
    }
  };

  const handleCustomButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleUploadAndRestore = async () => {
    if (!selectedFile) {
      alert(LABEL_SELECT_FILE_PLEASE);
      return;
    }

    try {
      await actions.loadFromFile();
      router.push(URL_GAME);
    } catch (error) {
      alert(LABEL_INVALID_FILE);
      console.error("File non valido:", error);
    }
  };

  const handleRestoreFromLocalStorage = () => {
    actions.restoreFromLocalStorage();
    router.push(URL_GAME);
  };

  const divClasses = "flex w-full flex-col items-center text-center my-4";
  return (
    <div className="ui-text-dark m-8 mx-auto flex max-w-md flex-col items-center justify-center gap-4">
      <h1 className=" ui-text-title m-2">{LABEL_RESTORE_GAME}</h1>

      <div className={`${divClasses}`}>
        <Label htmlFor="restore">{LABEL_UPLOAD_FILE}</Label>
        <input
          type="file"
          accept=".json"
          onChange={handleFileChange}
          ref={fileInputRef}
          className="hidden" // Nasconde l'input nativo
        />
        <button
          type="button"
          onClick={handleCustomButtonClick}
          className=" ui-border-focus ui-text-normal mt-2 w-full p-2"
        >
          {selectedFile ? selectedFile.name : LABEL_SELECT_FILE}
        </button>
        <Button
          color="blue"
          onClick={handleUploadAndRestore}
          disabled={!selectedFile}
          className="w-full"
        >
          {LABEL_LOAD_AND_RESUME}
        </Button>
      </div>

      {hasSavedGame && (
        <div className={`${divClasses}`}>
          <Label htmlFor="continue-local">{LABEL_CONTINUE_GAME_TITLE}</Label>
          <Button
            className="mx-auto w-full"
            color="green"
            onClick={handleRestoreFromLocalStorage}
          >
            {LABEL_CONTINUE_GAME_BUTTON}
          </Button>
        </div>
      )}

      {!hasSavedGame && !selectedFile && (
        <div className={`${divClasses}`}>
          <Label htmlFor="restore">{LABEL_NO_SAVE_NO_STORAGE}</Label>
        </div>
      )}
    </div>
  );
}
