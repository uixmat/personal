import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { GeistSerif } from "geist/font/serif";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://uixmat.dev"),
  title: {
    default: "Matt Litherland — Head of Product at Cal.com, author of Bklit UI",
    template: "%s — Matt Litherland",
  },
  description:
    "Matt Litherland is Head of Product at Cal.com and the author of Bklit UI. Design engineer in Veliko Tarnovo, Bulgaria, usually found in Pirin.",
  alternates: {
    types: { "application/rss+xml": "/writing/rss.xml" },
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      className={`${GeistSans.variable} ${GeistMono.variable} ${GeistSerif.variable}`}
      lang="en"
    >
      <body className="bg-night text-ink min-h-dvh">{children}</body>
    </html>
  );
}
