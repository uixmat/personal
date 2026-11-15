import { readFile } from "node:fs/promises";
import path from "node:path";
import { LAUNCHES, SETUP, VALA_SPECS } from "@/components/home/content";
import {
  homeMarkdown,
  MARKDOWN_TYPE,
  notFoundMarkdown,
  postMarkdown,
  resolveMarkdown,
  writingMarkdown,
} from "@/lib/agent";
import { getPosts } from "@/lib/writing";

const markdown = (body: string, status = 200) =>
  new Response(body, {
    status,
    headers: { "Content-Type": MARKDOWN_TYPE, Vary: "Accept" },
  });

/** Markdown versions of every page; reached via `.md` URLs or `Accept: text/markdown`. */
export async function GET(
  _request: Request,
  { params }: RouteContext<"/md/[[...path]]">
) {
  const { path: segments = [] } = await params;
  const posts = await getPosts();
  const target = resolveMarkdown(
    segments,
    posts.map((p) => p.slug)
  );

  switch (target.kind) {
    case "home":
      return markdown(
        homeMarkdown({
          launches: LAUNCHES,
          setup: SETUP,
          bike: VALA_SPECS,
          posts,
        })
      );
    case "writing":
      return markdown(writingMarkdown(posts));
    case "post": {
      const post = posts.find((p) => p.slug === target.slug);
      const source = await readFile(
        path.join(process.cwd(), "src/content/writing", `${target.slug}.mdx`),
        "utf8"
      );
      return post
        ? markdown(postMarkdown(post, source))
        : markdown(notFoundMarkdown(`/writing/${target.slug}`), 404);
    }
    default:
      return markdown(notFoundMarkdown(target.path), 404);
  }
}
