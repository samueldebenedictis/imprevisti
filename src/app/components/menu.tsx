"use client";

import Link from "next/link";
import { useState } from "react";
import { useSoundSettings } from "../../store/sound-store";
import { URL_FEEDBACK, URL_GAME, URL_HOME, URL_RESTORE_GAME } from "../../vars";
import {
  LABEL_AUDIO_SETTINGS,
  LABEL_CONTINUE_GAME,
  LABEL_LOAD_GAME,
  LABEL_MENU,
  LABEL_NEW_GAME,
  LABEL_SOUNDS_DISABLED,
  LABEL_SOUNDS_ENABLED,
  MODAL_CLOSE_BUTTON,
} from "../texts";
import { soundManager } from "../utils/sound-manager";
import Button from "./ui/button";
import { Divider } from "./ui/divider";
import { LabelCheckbox } from "./ui/label";

interface MenuItem {
  text: string;
  url: string;
}

const menuItems: MenuItem[] = [
  { text: LABEL_CONTINUE_GAME, url: URL_GAME },
  { text: LABEL_NEW_GAME, url: URL_HOME },
  { text: LABEL_LOAD_GAME, url: URL_RESTORE_GAME },
];

export default function Menu() {
  const closeFunction = (e: { key: string }) => {
    if (e.key === "Escape" || e.key === " ") {
      closeMenu();
    }
  };

  const [isOpen, setIsOpen] = useState(false);
  const { isSoundEnabled, toggleSound } = useSoundSettings();

  const toggleMenu = () => {
    // Genera il suono
    soundManager.playButtonClick();
    // Esegue l'azione
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const handleSoundToggle = () => {
    toggleSound();
  };

  return (
    <>
      <button
        type="button"
        onClick={toggleMenu}
        className="ui-text-title ui-animation-scale ui-text-light hover:underline"
      >
        {LABEL_MENU}
      </button>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={closeMenu}
          onKeyDown={closeFunction}
          role="dialog"
          aria-label="Close menu"
        >
          <div
            className="ui-text-dark ui-border-dark min-w-[600px] bg-white p-6 text-center shadow-lg"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={closeFunction}
            role="dialog"
            aria-modal="true"
          >
            <h2 className="ui-text-title mb-4">{LABEL_MENU}</h2>
            <div className="mt-6">
              {menuItems.map((item) => (
                <Link key={item.url} href={item.url} prefetch={false}>
                  <Button color="blue" className="w-full" onClick={closeMenu}>
                    {item.text}
                  </Button>
                </Link>
              ))}
            </div>

            <Divider />

            <Link key={URL_FEEDBACK} href={URL_FEEDBACK} prefetch={false}>
              <Button color="yellow" className="w-full" onClick={closeMenu}>
                Dai un feedback!
              </Button>
            </Link>

            <Divider />

            {/* Sound Settings */}
            <div className="ui-text-dark mt-6 border-gray-200">
              <h3 className="ui-text-subtitle mb-4">{LABEL_AUDIO_SETTINGS}</h3>
              <div className="flex items-center justify-center space-x-3">
                <input
                  type="checkbox"
                  id="sound-toggle"
                  name="sound-toggle"
                  checked={isSoundEnabled}
                  onChange={handleSoundToggle}
                  className="ui-custom-checkbox mr-2"
                />
                <LabelCheckbox htmlFor="sound-toggle">
                  {isSoundEnabled
                    ? LABEL_SOUNDS_ENABLED
                    : LABEL_SOUNDS_DISABLED}
                </LabelCheckbox>
              </div>
            </div>

            <div className="mt-6">
              <Button onClick={closeMenu} color="red" className="w-full">
                {MODAL_CLOSE_BUTTON}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
