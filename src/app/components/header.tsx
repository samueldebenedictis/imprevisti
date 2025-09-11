"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { URL_INSTRUCTION } from "../../vars";
import { soundManager } from "../utils/sound-manager";
import Menu from "./menu";
import { colorToCss } from "./ui/color";

const headerTextClasses =
  "ui-text-title ui-animation-scale ui-text-light hover:underline";

function HeaderLink(props: { text: string; url: string }) {
  return (
    <Link
      href={props.url}
      onClick={() => soundManager.playButtonClick()}
      prefetch={false}
      className={headerTextClasses}
    >
      {props.text}
    </Link>
  );
}

export default function Header() {
  const pathname = usePathname();

  const handleBack = () => {
    // Genera il suono
    soundManager.playButtonClick();
    // Esegue l'azione
    window.history.back();
  };

  return (
    <header className={`sticky top-0 z-10 ${colorToCss("blue")}`}>
      <nav className="mx-auto flex max-h-20 max-w-sm items-center justify-between p-8">
        <Menu />
        {pathname === "/instructions" ? (
          <button
            type="button"
            onClick={handleBack}
            className={headerTextClasses}
          >
            INDIETRO
          </button>
        ) : (
          <HeaderLink text="ISTRUZIONI" url={URL_INSTRUCTION} />
        )}
      </nav>
    </header>
  );
}
