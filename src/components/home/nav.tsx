import { IconFeather, IconGithub, IconInstagram, IconX } from "central-icons";
import Link from "next/link";
import { site } from "@/lib/site";

const link =
  "-my-3 flex items-center gap-1.5 py-3 text-ink-2 text-sm transition-colors duration-150 hover:text-ink";

export function Nav() {
  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 md:px-10">
        <Link
          className="text-ink -my-3 py-3 text-sm font-black tracking-tight"
          href="/"
        >
          UIXMAT
        </Link>
        <nav aria-label="Primary" className="flex items-center gap-5">
          <a className={`${link} hidden sm:flex`} href="#cal">
            Cal.com
          </a>
          <a className={`${link} hidden sm:flex`} href="#bklit">
            Bklit
          </a>
          <Link className={link} href="/writing">
            <IconFeather aria-hidden="true" className="size-4" />
            Writing
          </Link>
          <a
            aria-label="Instagram"
            className={`${link} relative before:absolute before:-inset-2`}
            href={site.instagram}
            rel="me noopener"
            target="_blank"
          >
            <IconInstagram aria-hidden="true" className="size-4" />
          </a>
          <a
            aria-label="GitHub"
            className={`${link} relative before:absolute before:-inset-2`}
            href={site.github}
            rel="me noopener"
            target="_blank"
          >
            <IconGithub aria-hidden="true" className="size-4.5" />
          </a>
          <a
            aria-label="X"
            className={`${link} relative before:absolute before:-inset-2`}
            href={site.x}
            rel="me noopener"
            target="_blank"
          >
            <IconX aria-hidden="true" className="size-4" />
          </a>
        </nav>
      </div>
    </header>
  );
}
