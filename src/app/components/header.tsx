"use client";

import Link from "next/link";
import { URL_INSTRUCTION } from "../vars";
import { colorToCss } from "./ui/color";
import DropdownMenu from "./ui/dropdown-menu";

function HeaderLink(props: { text: string; url: string }) {
  return (
    <Link
      href={props.url}
      prefetch={false}
      className="ui-text-title ui-animation-scale ui-text-light hover:underline"
    >
      {props.text}
    </Link>
  );
}

export default function Header() {
  return (
    <header className={`sticky top-0 z-10 ${colorToCss("blue")}`}>
      <nav className="mx-auto flex max-h-20 max-w-sm items-center justify-between p-8">
        <DropdownMenu />
        {/* <HeaderLink text="NUOVA PARTITA" url={URL_HOME} />
        <HeaderLink text="CONTINUA PARTITA" url={URL_GAME} />
        <HeaderLink text="CARICA PARTITA" url={URL_RESTORE_GAME} /> */}
        <HeaderLink text="ISTRUZIONI" url={URL_INSTRUCTION} />
      </nav>
    </header>
  );
}
