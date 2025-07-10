import type { Metadata } from "next";
import { Geist, Geist_Mono, Londrina_Shadow } from "next/font/google";
import "./globals.css";

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

export const metadata: Metadata = {
  title: "La Città degli Imprevisti",
  description: "La Città degli Imprevisti",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${londrinaShadow.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
