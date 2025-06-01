// app/layout.tsx
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";

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
    <html lang="en" className={`${GeistSans.variable} font-sans`}>
      <body>{children}</body>
    </html>
  );
}
