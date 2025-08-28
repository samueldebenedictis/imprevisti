"use client";

import Link from "next/link";
import { URL_GAME, URL_HOME } from "../vars";
import { colorToCss } from "./ui/color";

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
    <header className={`sticky top-0 z-10 ${colorToCss("yellow")}`}>
      <nav className="mx-auto flex max-h-20 max-w-6xl items-center justify-between p-8">
        <HeaderLink text="HOME" url={URL_HOME} />
        <HeaderLink text="VAI AL GIOCO" url={URL_GAME} />
      </nav>
    </header>
  );
}
