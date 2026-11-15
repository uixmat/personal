import { readdir } from "node:fs/promises";
import path from "node:path";

export interface PostMeta {
  /** ISO date, e.g. 2026-11-15 */
  date: string;
  /** Drafts render in development only. */
  draft?: boolean;
  summary: string;
  title: string;
}

export interface Post extends PostMeta {
  slug: string;
}

const MDX_EXT = /\.mdx$/u;

const DIR = path.join(process.cwd(), "src/content/writing");

export const isProduction = process.env.NODE_ENV === "production";

export async function getSlugs(): Promise<string[]> {
  "use cache";
  const files = await readdir(DIR);
  return files
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.replace(MDX_EXT, ""));
}

export async function getPost(slug: string) {
  const mod: { default: React.ComponentType; metadata: PostMeta } =
    await import(`@/content/writing/${slug}.mdx`);
  return { Content: mod.default, meta: { ...mod.metadata, slug } };
}

/** Published posts, newest first. Drafts are included outside production. */
export async function getPosts(): Promise<Post[]> {
  "use cache";
  const slugs = await getSlugs();
  const posts = await Promise.all(
    slugs.map(async (slug) => (await getPost(slug)).meta)
  );
  return posts
    .filter((post) => !(isProduction && post.draft))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function formatDate(date: string) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}
