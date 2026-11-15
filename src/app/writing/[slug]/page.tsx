import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Nav } from "@/components/home/nav";
import { Footer } from "@/components/site/footer";
import { formatDate, getPost, getSlugs, isProduction } from "@/lib/writing";

// Every post is prerendered from generateStaticParams; the params read is static.
export const instant = false;

export async function generateStaticParams() {
  return (await getSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/writing/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  if (!(await getSlugs()).includes(slug)) {
    return {};
  }
  const { meta } = await getPost(slug);
  return {
    title: meta.title,
    description: meta.summary,
    alternates: {
      canonical: `/writing/${slug}`,
      types: {
        "application/rss+xml": "/writing/rss.xml",
        "text/markdown": `/writing/${slug}.md`,
      },
    },
    openGraph: { type: "article", publishedTime: meta.date },
  };
}

export default async function PostPage({
  params,
}: PageProps<"/writing/[slug]">) {
  const { slug } = await params;
  if (!(await getSlugs()).includes(slug)) {
    notFound();
  }
  const { Content, meta } = await getPost(slug);
  if (isProduction && meta.draft) {
    notFound();
  }

  return (
    <>
      <Nav />
      <main className="mx-auto grid w-full max-w-7xl grid-cols-12 gap-x-6 px-6 pt-36 pb-32 md:px-10">
        <div className="col-span-12 mb-10 flex flex-col gap-3 md:col-span-3">
          <Link
            className="text-ink-3 hover:text-ink -my-3 w-fit py-3 text-sm transition-colors duration-150"
            href="/writing"
          >
            ← Writing
          </Link>
          <time
            className="text-ink-3 font-mono text-xs tabular-nums"
            dateTime={meta.date}
          >
            {formatDate(meta.date)}
          </time>
        </div>
        <article className="col-span-12 md:col-span-9">
          <h1 className="mb-6 max-w-[20ch] text-5xl font-medium tracking-[-0.035em] md:text-6xl">
            {meta.title}
          </h1>
          <p className="text-ink-2 text-lede mb-16 max-w-[50ch] [text-wrap:pretty]">
            {meta.summary}
          </p>
          <div className="text-ink-2 max-w-[65ch] font-serif text-[1.1875rem] leading-[1.65]">
            <Content />
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
