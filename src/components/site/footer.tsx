import { IconGithub, IconInstagram, IconRssFeed, IconX } from "central-icons";
import Link from "next/link";
import { siStrava } from "simple-icons";
import { site } from "@/lib/site";

const YEAR = new Date().getFullYear();
const link =
  "relative flex size-5 items-center justify-center text-ink-3 transition-colors duration-150 before:absolute before:-inset-3 hover:text-ink";

/** Strava's own mark (Central has no Strava icon). */
function StravaLogo({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d={siStrava.path} />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-6 py-10 md:px-10">
      <span className="text-ink-3 font-mono text-xs">© {YEAR}</span>
      <nav aria-label="Elsewhere" className="flex items-center gap-6">
        <a
          aria-label="GitHub"
          className={link}
          href={site.github}
          rel="me noopener"
          target="_blank"
        >
          <IconGithub aria-hidden="true" className="size-[18px]" />
        </a>
        <a
          aria-label="X"
          className={link}
          href={site.x}
          rel="me noopener"
          target="_blank"
        >
          <IconX aria-hidden="true" className="size-4" />
        </a>
        <a
          aria-label="Instagram"
          className={link}
          href={site.instagram}
          rel="me noopener"
          target="_blank"
        >
          <IconInstagram aria-hidden="true" className="size-[18px]" />
        </a>
        <a
          aria-label="Strava"
          className={link}
          href="https://www.strava.com/athletes/uixmat"
          rel="me noopener"
          target="_blank"
        >
          <StravaLogo className="size-4" />
        </a>
        <Link aria-label="RSS feed" className={link} href="/writing/rss.xml">
          <IconRssFeed aria-hidden="true" className="size-[18px]" />
        </Link>
      </nav>
    </footer>
  );
}
