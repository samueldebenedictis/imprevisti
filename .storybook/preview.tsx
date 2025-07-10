import type { Preview } from "@storybook/react";
import { Geist, Geist_Mono, Londrina_Shadow } from "next/font/google";
import "../src/app/globals.css";
import "./storybook.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const londrinaShadow = Londrina_Shadow({
  weight: "400",
  variable: "--font-londrina-shadow",
  subsets: ["latin"],
});

const preview: Preview = {
  parameters: {
    backgrounds: {
      values: [
        { name: "dark", value: "#000000" },
        { name: "light", value: "ffffff" },
      ],
      default: "light",
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    (Story) => (
      <div
        className={`${geistSans.variable} ${geistMono.variable} ${londrinaShadow.variable}`}
      >
        <Story />
      </div>
    ),
  ],
};

export default preview;
