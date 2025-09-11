"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useGameStore } from "../../store/game-store";
import { URL_GAME } from "../../vars";
import Button from "../components/ui/button";
import {
  LABEL_CONTINUE_GAME_BUTTON,
  LABEL_CONTINUE_GAME_TITLE,
  LABEL_NO_SAVE_NO_STORAGE,
  LABEL_RESTORE_GAME_TITLE,
  LABEL_UPLOAD_FILE,
} from "../texts";

function Label(props: { children: string; htmlFor: string }) {
  return (
    <label htmlFor={props.htmlFor} className="ui-text-dark ui-text-subtitle">
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
      alert("Per favore, seleziona un file.");
      return;
    }

    try {
      await actions.loadFromFile();
      router.push(URL_GAME);
    } catch (error) {
      alert("File non valido.");
      console.error("File non valido:", error);
    }
  };

  const handleRestoreFromLocalStorage = () => {
    actions.restoreFromLocalStorage();
    router.push(URL_GAME);
  };

  const divClasses = "flex w-full flex-col items-center text-center my-4";
  return (
    <div className="m-8 mx-auto flex max-w-md flex-col items-center justify-center gap-4">
      <h1 className="ui-text-dark ui-text-title m-2">
        {LABEL_RESTORE_GAME_TITLE}
      </h1>

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
          className="ui-text-dark ui-border-focus ui-text-normal mt-2 w-full p-2"
        >
          {selectedFile ? selectedFile.name : "Seleziona un file..."}
        </button>
        <Button
          color="blue"
          onClick={handleUploadAndRestore}
          disabled={!selectedFile}
          className="w-full"
        >
          Carica e riprendi
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
