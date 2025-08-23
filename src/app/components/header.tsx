"use client";

import Link from "next/link";
import { URL_GAME, URL_HOME } from "../vars";
import { colorToCss } from "./color";

function HeaderLink(props: { text: string; url: string }) {
  return (
    <Link
      href={props.url}
      prefetch={false}
      className="transition-all duration-200 hover:scale-110 hover:underline font-londrina-solid text-xl text-gray-200"
    >
      {props.text}
    </Link>
  );
}

export default function Header() {
  return (
    <header className={`sticky top-0 z-10 ${colorToCss("yellow")}`}>
      <nav className="mx-auto flex max-h-20 max-w-7xl items-center justify-between p-6 lg:px-8">
        <HeaderLink text="HOME" url={URL_HOME} />
        <HeaderLink text="VAI AL GIOCO" url={URL_GAME} />
      </nav>
    </header>
  );
}
