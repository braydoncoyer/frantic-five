// app/layout.tsx
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import localFont from "next/font/local";
import "./globals.css";
import { VemetricScript } from "@vemetric/react";

const helveticaNeue = localFont({
  src: [
    {
      path: "../../public/fonts/HelveticaNeueRoman.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/HelveticaNeueBold.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-helvetica-neue",
  display: "swap",
  preload: true,
  fallback: ["Arial", "sans-serif"],
});

export const metadata: Metadata = {
  title: "Frantic Five - Daily Word Game",
  description:
    "A daily word puzzle game where you find the secret word that falls alphabetically between two others.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${helveticaNeue.variable} font-sans`}
    >
      <head>
        <link rel="icon" href="/favicon.ico" sizes="48x48" />
        <link rel="icon" href="/icon.svg" sizes="any" type="image/svg+xml" />
        <link rel="apple-icon" href="/apple-touch-icon.png" />
      </head>
      <body>
        <VemetricScript token="31FuNJM6tS1zmuxp" />
        {children}
      </body>
    </html>
  );
}
