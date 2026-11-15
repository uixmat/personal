import Link from "next/link";
import { formatDate, type Post } from "@/lib/writing";

export function WritingList({ posts }: { posts: Post[] }) {
  if (posts.length === 0) {
    return (
      <p className="text-ink-2 max-w-[44ch] font-serif text-lg [text-wrap:pretty]">
        Nothing published yet. The first essay is on its way; follow along via{" "}
        <Link
          className="text-ink decoration-ink-3/50 hover:decoration-ink underline underline-offset-4"
          href="/writing/rss.xml"
        >
          RSS
        </Link>
        .
      </p>
    );
  }

  return (
    <ol>
      {posts.map((post) => (
        <li className="border-rule border-t last:border-b" key={post.slug}>
          <Link
            className="group grid grid-cols-9 items-baseline gap-x-6 gap-y-1 py-5"
            href={`/writing/${post.slug}`}
          >
            <time
              className="text-ink-3 col-span-9 font-mono text-xs tabular-nums md:col-span-2"
              dateTime={post.date}
            >
              {formatDate(post.date)}
            </time>
            <span className="text-ink group-hover:text-ink-2 col-span-9 font-serif text-xl transition-colors duration-150 md:col-span-7">
              {post.title}
              {post.draft ? (
                <span className="text-signal ml-3 align-middle font-sans text-xs">
                  Draft
                </span>
              ) : null}
            </span>
            <span className="text-ink-2 col-span-9 md:col-span-7 md:col-start-3">
              {post.summary}
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}
