"use client";

import Link from "next/link";
import { useState } from "react";
import { URL_GAME, URL_HOME, URL_RESTORE_GAME } from "../../vars";

interface DropdownMenuItem {
  text: string;
  url: string;
}

const menuItems: DropdownMenuItem[] = [
  { text: "NUOVA PARTITA", url: URL_HOME },
  { text: "CONTINUA PARTITA", url: URL_GAME },
  { text: "CARICA PARTITA", url: URL_RESTORE_GAME },
  // { text: "ISTRUZIONI", url: URL_INSTRUCTION },
];

export default function DropdownMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={toggleMenu}
        className="ui-text-title ui-animation-scale ui-text-light hover:underline"
      >
        MENU
      </button>
      {isOpen && (
        <div
          className={`ui-border-dark absolute left-0 mt-2 w-84 bg-blue-500 shadow-lg`}
        >
          <div className="">
            {menuItems.map((item, index) => (
              <Link
                key={item.url}
                href={item.url}
                prefetch={false}
                className={`ui-text-subtitle ui-text-light block ${index % 2 ? "bg-blue-500" : "bg-blue-400"} p-2 hover:underline`}
                onClick={() => setIsOpen(false)}
              >
                {item.text}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
