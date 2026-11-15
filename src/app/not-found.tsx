import Link from "next/link";
import { Nav } from "@/components/home/nav";
import { Footer } from "@/components/site/footer";

export default function NotFound() {
  return (
    <>
      <Nav />
      <main className="mx-auto flex min-h-[70dvh] max-w-[1120px] flex-col justify-center gap-6 px-6 pt-36 pb-32 md:px-10">
        <p className="text-ink-3 font-mono text-xs">404</p>
        <h1 className="text-5xl font-black tracking-[-0.04em] md:text-6xl">
          Nothing here.
        </h1>
        <p className="text-ink-2 max-w-[44ch] font-serif text-xl">
          That page doesn&apos;t exist. Try the{" "}
          <Link
            className="text-ink decoration-ink-3/50 hover:decoration-ink underline underline-offset-4"
            href="/"
          >
            home page
          </Link>{" "}
          or the{" "}
          <Link
            className="text-ink decoration-ink-3/50 hover:decoration-ink underline underline-offset-4"
            href="/writing"
          >
            writing index
          </Link>
          .
        </p>
      </main>
      <Footer />
    </>
  );
}
