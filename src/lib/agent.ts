/**
 * Machine-readable views of the site for agents: Markdown versions of each
 * page, llms.txt, and JSON-LD. Pure functions over plain data, so the routes
 * stay thin and everything here is unit-tested (agent.test.ts).
 */
import { site } from "./site";

export const MARKDOWN_TYPE = "text/markdown; charset=utf-8";

export interface PostSummary {
  date: string;
  slug: string;
  summary: string;
  title: string;
}

export interface HomeContent {
  bike: readonly (readonly [string, string])[];
  launches: { name: string; note: string }[];
  posts: PostSummary[];
  setup: { role: string; name: string; href: string }[];
}

/* Negotiation ---------------------------------------------------------------- */

/** Parse an Accept header into media ranges with q-values. */
function mediaRanges(accept: string) {
  return accept
    .split(",")
    .map((part) => {
      const [type = "", ...params] = part.trim().toLowerCase().split(";");
      const q = params.map((p) => p.trim()).find((p) => p.startsWith("q="));
      return { type: type.trim(), q: q ? Number(q.slice(2)) : 1 };
    })
    .filter((r) => r.type && !Number.isNaN(r.q));
}

/**
 * True when the client explicitly asks for Markdown and prefers it at least as
 * much as HTML. Wildcards never select Markdown — browsers send `*\/*`.
 */
export function prefersMarkdown(accept: string | null | undefined): boolean {
  if (!accept) {
    return false;
  }
  const ranges = mediaRanges(accept);
  const md = ranges.find((r) => r.type === "text/markdown");
  if (!md || md.q <= 0) {
    return false;
  }
  const html = ranges.find((r) => r.type === "text/html");
  return !html || md.q >= html.q;
}

const MD_SUFFIX = /\.md$/u;

/**
 * Where a request should be served from when Markdown is wanted, or null to
 * leave it alone. `/foo.md` always maps; other paths map only when the Accept
 * header prefers Markdown. Result is a path under the `/md` route handler.
 */
export function markdownRewrite(
  pathname: string,
  accept: string | null | undefined
): string | null {
  if (pathname.startsWith("/md/") || pathname === "/md") {
    return null;
  }
  if (MD_SUFFIX.test(pathname)) {
    const base = pathname.replace(MD_SUFFIX, "");
    return base === "/index" ? "/md" : `/md${base}`;
  }
  if (!prefersMarkdown(accept)) {
    return null;
  }
  return pathname === "/" ? "/md" : `/md${pathname}`;
}

/** What a Markdown request path resolves to. */
export type MarkdownTarget =
  | { kind: "home" }
  | { kind: "writing" }
  | { kind: "post"; slug: string }
  | { kind: "not-found"; path: string };

export function resolveMarkdown(
  segments: string[],
  slugs: string[]
): MarkdownTarget {
  const [first, second, ...rest] = segments;
  if (segments.length === 0 || (segments.length === 1 && first === "index")) {
    return { kind: "home" };
  }
  if (first === "writing" && segments.length === 1) {
    return { kind: "writing" };
  }
  if (
    first === "writing" &&
    second &&
    rest.length === 0 &&
    slugs.includes(second)
  ) {
    return { kind: "post", slug: second };
  }
  return { kind: "not-found", path: `/${segments.join("/")}` };
}

/* Documents ------------------------------------------------------------------- */

const abs = (path: string) => `${site.url}${path}`;

const postLine = (p: PostSummary) =>
  `- [${p.title}](${abs(`/writing/${p.slug}.md`)}) (${p.date}): ${p.summary}`;

export function homeMarkdown(c: HomeContent): string {
  return `# ${site.name}

${site.title}. Author of [Bklit UI](${site.bklit}). Based in ${site.location}, mostly found in the Pirin mountains.

${site.description}

## Cal.com

Head of Product at [Cal.com](${site.cal}). In November 2026 Cal.com launched five products; Matt was responsible for all of them:

${c.launches.map((l) => `- **${l.name}**: ${l.note}`).join("\n")}

## Bklit UI

[Bklit UI](${site.bklit}) is an open-source chart and data-viz library for React, built on d3, Motion and Tailwind. It is a member of the Vercel OSS Program. The charts on this site are Bklit components drawn from real data: Bansko weather, GitHub activity and npm downloads.

Other open source: [Onborda](https://github.com/uixmat/onborda) (onboarding tours for Next.js), [shadcn-country-dropdown](https://github.com/uixmat/shadcn-country-dropdown), [Firestarta](https://github.com/uixmat/firestarta).

## Off the clock

Backcountry snowboarding when there's snow, enduro mountain biking when there isn't.

Winter setup:

${c.setup.map((s) => `- ${s.role}: [${s.name}](${s.href})`).join("\n")}

Bike: Santa Cruz Vala XX AXS RSV.

${c.bike.map(([k, v]) => `- ${k}: ${v}`).join("\n")}

## Writing

${c.posts.length ? c.posts.map(postLine).join("\n") : "Nothing published yet. Follow the RSS feed for the first essay."}

## Elsewhere

- GitHub: ${site.github}
- X: ${site.x}
- Instagram: ${site.instagram}
- Strava: ${site.strava}
- RSS: ${abs("/writing/rss.xml")}
`;
}

export function writingMarkdown(posts: PostSummary[]): string {
  return `# Writing

Essays by ${site.name} on design engineering, product, and the occasional trail report.

${posts.length ? posts.map(postLine).join("\n") : "Nothing published yet. The first essay is on its way."}

RSS: ${abs("/writing/rss.xml")}
`;
}

const METADATA_EXPORT = /export\s+const\s+metadata\s*=\s*\{[\s\S]*?\};?\s*\n/u;

/** A post's MDX source as plain Markdown: metadata export removed, title + date prepended. */
export function postMarkdown(post: PostSummary, mdxSource: string): string {
  const body = mdxSource.replace(METADATA_EXPORT, "").trim();
  return `# ${post.title}

${post.date} · ${site.name}

> ${post.summary}

${body}
`;
}

export function notFoundMarkdown(path: string): string {
  return `# Not found

There is no page at \`${path}\` on ${site.url}.

- Home: ${abs("/index.md")}
- Writing: ${abs("/writing.md")}
- Site index for agents: ${abs("/llms.txt")}
- Sitemap: ${abs("/sitemap.xml")}
`;
}

/** llms.txt, per https://llmstxt.org: H1, blockquote summary, then H2 link lists. */
export function llmsTxt(posts: PostSummary[]): string {
  return `# ${site.name}

> ${site.description}

Every page is available as Markdown: append \`.md\` to its URL, or request it with \`Accept: text/markdown\`.

## Pages

- [Home](${abs("/index.md")}): Cal.com launches, Bklit UI, winter setup and bike, writing
- [Writing](${abs("/writing.md")}): essay index

## Writing

${posts.length ? posts.map((p) => `- [${p.title}](${abs(`/writing/${p.slug}.md`)}): ${p.summary}`).join("\n") : "- No posts published yet"}

## Optional

- [Bklit UI](${site.bklit}): open-source React chart library by ${site.name}
- [GitHub](${site.github})
- [RSS](${abs("/writing/rss.xml")})
`;
}

/* JSON-LD --------------------------------------------------------------------- */

export function homeJsonLd() {
  const person = {
    "@type": "Person",
    "@id": `${site.url}/#person`,
    name: site.name,
    alternateName: site.handle,
    url: site.url,
    image: `${site.url}/opengraph-image.png`,
    description: site.description,
    jobTitle: "Head of Product",
    worksFor: { "@type": "Organization", name: "Cal.com", url: site.cal },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Veliko Tarnovo",
      addressCountry: "BG",
    },
    knowsAbout: [...site.keywords],
    sameAs: [site.github, site.x, site.instagram, site.strava, site.bklit],
  };
  return {
    "@context": "https://schema.org",
    "@graph": [
      person,
      {
        "@type": "WebSite",
        "@id": `${site.url}/#website`,
        url: site.url,
        name: site.name,
        description: site.description,
        author: { "@id": person["@id"] },
        inLanguage: "en",
      },
      {
        "@type": "SoftwareSourceCode",
        name: "Bklit UI",
        url: site.bklit,
        codeRepository: "https://github.com/bklit/bklit-ui",
        programmingLanguage: "TypeScript",
        description:
          "Open-source chart and data-viz library for React, built on d3, Motion and Tailwind.",
        author: { "@id": person["@id"] },
      },
    ],
  };
}

/** Serialise JSON-LD for a <script> tag; escapes `<` so it can't close the tag. */
export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data).replace(/</gu, "\\u003c");
}
