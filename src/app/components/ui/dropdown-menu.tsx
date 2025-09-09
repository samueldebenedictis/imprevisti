"use client";

import Link from "next/link";
import { useState } from "react";
import { MODAL_CLOSE_BUTTON } from "../../texts";
import { URL_GAME, URL_HOME, URL_RESTORE_GAME } from "../../vars";
import Button from "./button";

interface DropdownMenuItem {
  text: string;
  url: string;
}

const menuItems: DropdownMenuItem[] = [
  { text: "Continua partita", url: URL_GAME },
  { text: "Nuova partita", url: URL_HOME },
  { text: "Carica partita", url: URL_RESTORE_GAME },
  // { text: "ISTRUZIONI", url: URL_INSTRUCTION },
];

export default function DropdownMenu() {
  const closeFunction = (e: { key: string }) => {
    if (e.key === "Escape" || e.key === " ") {
      closeMenu();
    }
  };

  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={toggleMenu}
        className="ui-text-title ui-animation-scale ui-text-light hover:underline"
      >
        MENU
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
            className="ui-border-dark min-w-[600px] bg-white p-6 text-center shadow-lg"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={closeFunction}
            role="dialog"
            aria-modal="true"
          >
            <h2 className="ui-text-dark ui-text-title mb-4">MENU</h2>
            <div className="mt-6">
              {menuItems.map((item) => (
                <Link
                  key={item.url}
                  href={item.url}
                  prefetch={false}
                  onClick={closeMenu}
                >
                  <Button color="blue" className="w-full">
                    {item.text}
                  </Button>
                </Link>
              ))}
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
