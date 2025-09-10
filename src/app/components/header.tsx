"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { URL_INSTRUCTION } from "../../vars";
import { colorToCss } from "./ui/color";
import DropdownMenu from "./ui/dropdown-menu";

const headerTextClasses =
  "ui-text-title ui-animation-scale ui-text-light hover:underline";

function HeaderLink(props: { text: string; url: string }) {
  return (
    <Link href={props.url} prefetch={false} className={headerTextClasses}>
      {props.text}
    </Link>
  );
}

export default function Header() {
  const pathname = usePathname();

  const handleBack = () => {
    window.history.back();
  };

  return (
    <header className={`sticky top-0 z-10 ${colorToCss("blue")}`}>
      <nav className="mx-auto flex max-h-20 max-w-sm items-center justify-between p-8">
        <DropdownMenu />
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
