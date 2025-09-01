"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Button from "../components/ui/button";
import {
  LABEL_CONTINUE_GAME_BUTTON,
  LABEL_CONTINUE_GAME_TITLE,
  LABEL_NO_SAVE_NO_STORAGE,
  LABEL_RESTORE_GAME_TITLE,
  LABEL_UPLOAD_FILE,
} from "../texts";
import { loadGame, loadGameFromLocalStorage } from "../utils/game-storage";
import { STORAGE_STATE_KEY_GAME_INSTANCE, URL_GAME } from "../vars";

function Label(props: { children: string; htmlFor: string }) {
  return (
    <label htmlFor={props.htmlFor} className="ui-text-dark ui-text-subtitle">
      {props.children}
    </label>
  );
}

export default function RestoreGamePage() {
  const router = useRouter();
  const [hasSavedGame, setHasSavedGame] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedGame = loadGameFromLocalStorage();
    if (savedGame) {
      setHasSavedGame(true);
    }
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleCustomButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleUploadAndRestore = () => {
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const jsonString = e.target?.result as string;
          const loadedGame = loadGame(jsonString);
          if (loadedGame) {
            localStorage.setItem(
              STORAGE_STATE_KEY_GAME_INSTANCE,
              JSON.stringify(loadedGame),
            );
            router.push(URL_GAME);
          } else {
            alert("File non valido.");
          }
        } catch (error) {
          alert("File non valido.");
          console.error("File non valido:", error);
        }
      };
      reader.readAsText(selectedFile);
    } else {
      alert("Per favore, seleziona un file.");
    }
  };

  const handleRestoreFromLocalStorage = () => {
    router.push(URL_GAME);
  };

  const divClasses = "flex w-full flex-col items-center text-center my-4";
  return (
    <div className="m-8 mx-auto flex max-w-md flex-col items-center justify-center gap-4">
      <h1 className="ui-text-dark ui-text-title m-2 text-center">
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
          className="ui-text-dark ui-border-focus ui-text-normal w-full p-2"
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
