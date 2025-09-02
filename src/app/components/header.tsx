"use client";

import { colorToCss } from "./ui/color";
import DropdownMenu from "./ui/dropdown-menu";

export default function Header() {
  return (
    <header className={`sticky top-0 z-10 ${colorToCss("yellow")}`}>
      <nav className="mx-auto flex max-h-20 max-w-6xl items-center justify-between p-8">
        <DropdownMenu />
      </nav>
    </header>
  );
}
