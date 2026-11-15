import type { Metadata } from "next";
import { Bklit } from "@/components/home/bklit";
import { HomePage } from "@/components/home/home-page";
import { Nav } from "@/components/home/nav";
import { OutlineDefs } from "@/components/home/type";
import { Writing } from "@/components/home/writing";
import { Footer } from "@/components/site/footer";
import { homeJsonLd, jsonLdScript } from "@/lib/agent";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": "/writing/rss.xml",
      "text/markdown": "/index.md",
    },
  },
};

export default function Home() {
  return (
    <>
      <script
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD, escaped by jsonLdScript
        dangerouslySetInnerHTML={{ __html: jsonLdScript(homeJsonLd()) }}
        type="application/ld+json"
      />
      <OutlineDefs />
      <Nav />
      <HomePage bklit={<Bklit />} writing={<Writing />} />
      <Footer />
    </>
  );
}
