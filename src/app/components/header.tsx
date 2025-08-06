"use client";

import Link from "next/link";
import { colorToCss } from "./color";

export default function Header() {
  return (
    <header className={`sticky top-0 z-10 ${colorToCss("yellow")}`}>
      <nav className="mx-auto flex max-h-20 max-w-7xl items-center justify-between p-6 lg:px-8">
        <Link
          href="/"
          prefetch={false}
          className="transition-all duration-200 hover:scale-110 hover:underline font-londrina-solid text-xl text-gray-200"
        >
          {" "}
          HOME
        </Link>
      </nav>
    </header>
  );
}
