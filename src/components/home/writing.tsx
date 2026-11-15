import { IconArrowUpRight, IconFeather, IconRssFeed } from "central-icons";
import Link from "next/link";
import { formatDate, getPosts } from "@/lib/writing";

export async function Writing() {
  const posts = (await getPosts()).slice(0, 5);

  return (
    <section
      aria-labelledby="writing-heading"
      className="mx-auto max-w-[1120px] px-6 py-32 md:px-10"
    >
      <div className="grid grid-cols-1 gap-10 md:grid-cols-[1fr_1.4fr]">
        <div className="flex flex-col items-start gap-5">
          <p className="text-ink-3 flex items-center gap-2 text-sm">
            <IconFeather aria-hidden="true" className="text-sky size-4" />
            Writing
          </p>
          <h2
            className="text-4xl font-black tracking-[-0.04em] md:text-5xl"
            id="writing-heading"
          >
            Notes from the build.
          </h2>
          <p className="text-ink-2 max-w-[36ch] font-serif text-lg [text-wrap:pretty]">
            Design engineering, product, and the occasional trail report.
          </p>
          <Link
            className="border-rule text-ink-2 hover:border-ink-3 hover:text-ink flex items-center gap-2 border px-3.5 py-2 text-sm transition-colors duration-150 active:scale-[0.97]"
            href="/writing/rss.xml"
          >
            <IconRssFeed aria-hidden="true" className="size-4" />
            Subscribe via RSS
          </Link>
        </div>

        <div className="surface grain [--grain:0.06]">
          <div className="border-rule text-ink-3 flex items-center justify-between border-b px-6 py-3 font-mono text-xs">
            <span>Index</span>
            <span className="tabular-nums">
              {String(posts.length).padStart(2, "0")} posts
            </span>
          </div>
          {posts.length === 0 ? (
            <div className="flex min-h-56 flex-col justify-center gap-3 px-6 py-10">
              <p className="text-ink font-serif text-xl">
                Nothing published yet.
              </p>
              <p className="text-ink-3 max-w-[40ch]">
                The first essay is on its way. Subscribe and it&apos;ll land in
                your reader.
              </p>
            </div>
          ) : (
            <ol>
              {posts.map((post, i) => (
                <li
                  className="border-rule border-b last:border-b-0"
                  key={post.slug}
                >
                  <Link
                    className="group flex items-baseline gap-4 px-6 py-4"
                    href={`/writing/${post.slug}`}
                  >
                    <span className="text-sky w-6 font-mono text-[11px] tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="flex flex-1 flex-col gap-1">
                      <span className="text-ink group-hover:text-ink-2 font-serif text-lg transition-colors duration-150">
                        {post.title}
                        {post.draft ? (
                          <span className="text-sky ml-2 align-middle font-mono text-[11px]">
                            Draft
                          </span>
                        ) : null}
                      </span>
                      <span className="text-ink-3 text-sm">{post.summary}</span>
                    </span>
                    <time
                      className="text-ink-3 font-mono text-xs tabular-nums"
                      dateTime={post.date}
                    >
                      {formatDate(post.date)}
                    </time>
                    <IconArrowUpRight
                      aria-hidden="true"
                      className="text-ink-3 group-hover:text-ink size-4 transition-colors"
                    />
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </section>
  );
}
