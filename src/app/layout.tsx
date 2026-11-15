import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { GeistSerif } from "geist/font/serif";
import type { Metadata } from "next";
import "./globals.css";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL("https://uixmat.dev"),
  title: {
    default: "Matt Litherland — Head of Product at Cal.com, author of Bklit UI",
    template: "%s — Matt Litherland",
  },
  description: site.description,
  keywords: [...site.keywords],
  authors: [{ name: site.name, url: site.url }],
  alternates: {
    types: { "application/rss+xml": "/writing/rss.xml" },
  },
  openGraph: {
    type: "profile",
    siteName: site.name,
    url: site.url,
  },
  twitter: { card: "summary_large_image", creator: "@uixmat" },
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
