import { describe, expect, test } from "bun:test";
import {
  homeJsonLd,
  homeMarkdown,
  jsonLdScript,
  llmsTxt,
  markdownRewrite,
  notFoundMarkdown,
  postMarkdown,
  prefersMarkdown,
  resolveMarkdown,
  writingMarkdown,
} from "./agent";

const HOME_LINK = /- \[Home\]\(https:\/\/uixmat\.dev\/index\.md\)/u;

const post = {
  slug: "hello",
  title: "Hello",
  date: "2026-11-15",
  summary: "A first post.",
};

describe("prefersMarkdown", () => {
  test("explicit markdown wins", () => {
    expect(prefersMarkdown("text/markdown")).toBe(true);
    expect(prefersMarkdown("text/markdown, text/html;q=0.8")).toBe(true);
  });
  test("browsers and wildcards get HTML", () => {
    expect(prefersMarkdown("text/html,application/xhtml+xml,*/*;q=0.8")).toBe(
      false
    );
    expect(prefersMarkdown("*/*")).toBe(false);
    expect(prefersMarkdown(null)).toBe(false);
  });
  test("q-values decide", () => {
    expect(prefersMarkdown("text/html, text/markdown;q=0.5")).toBe(false);
    expect(prefersMarkdown("text/markdown;q=0")).toBe(false);
    expect(prefersMarkdown("text/html;q=0.5, text/markdown;q=0.9")).toBe(true);
  });
});

describe("markdownRewrite", () => {
  test("negotiated paths map under /md", () => {
    expect(markdownRewrite("/", "text/markdown")).toBe("/md");
    expect(markdownRewrite("/writing", "text/markdown")).toBe("/md/writing");
    expect(markdownRewrite("/nope", "text/markdown")).toBe("/md/nope");
  });
  test(".md URLs map regardless of Accept", () => {
    expect(markdownRewrite("/index.md", "text/html")).toBe("/md");
    expect(markdownRewrite("/writing.md", null)).toBe("/md/writing");
    expect(markdownRewrite("/writing/hello.md", null)).toBe(
      "/md/writing/hello"
    );
  });
  test("HTML requests and /md itself pass through", () => {
    expect(markdownRewrite("/", "text/html")).toBeNull();
    expect(markdownRewrite("/md/writing", "text/markdown")).toBeNull();
  });
});

describe("resolveMarkdown", () => {
  test("known pages", () => {
    expect(resolveMarkdown([], [])).toEqual({ kind: "home" });
    expect(resolveMarkdown(["index"], [])).toEqual({ kind: "home" });
    expect(resolveMarkdown(["writing"], [])).toEqual({ kind: "writing" });
    expect(resolveMarkdown(["writing", "hello"], ["hello"])).toEqual({
      kind: "post",
      slug: "hello",
    });
  });
  test("unknown or unpublished paths are not found", () => {
    expect(resolveMarkdown(["writing", "draft"], ["hello"])).toEqual({
      kind: "not-found",
      path: "/writing/draft",
    });
    expect(resolveMarkdown(["a", "b"], [])).toEqual({
      kind: "not-found",
      path: "/a/b",
    });
  });
});

describe("documents", () => {
  const home = homeMarkdown({
    launches: [{ name: "Cal AI", note: "An assistant." }],
    setup: [{ role: "Goggles", name: "Electra 3", href: "https://out-of.com" }],
    bike: [["Fork", "FOX 36"]],
    posts: [post],
  });
  test("home has an H1, sections and real content", () => {
    expect(home.startsWith("# Matt Litherland\n")).toBe(true);
    for (const h of [
      "## Cal.com",
      "## Bklit UI",
      "## Off the clock",
      "## Writing",
    ]) {
      expect(home).toContain(h);
    }
    expect(home).toContain("- **Cal AI**: An assistant.");
    expect(home).toContain("[Hello](https://uixmat.dev/writing/hello.md)");
    expect(home.length).toBeGreaterThan(500);
  });
  test("writing index handles empty and filled", () => {
    expect(writingMarkdown([])).toContain("Nothing published yet");
    expect(writingMarkdown([post])).toContain("- [Hello]");
  });
  test("post strips the metadata export", () => {
    const md = postMarkdown(
      post,
      'export const metadata = {\n  title: "Hello",\n};\n\nBody text.\n'
    );
    expect(md).not.toContain("export const metadata");
    expect(md).toStartWith("# Hello");
    expect(md).toContain("Body text.");
  });
  test("404 explains and links onward", () => {
    const md = notFoundMarkdown("/missing");
    expect(md).toContain("`/missing`");
    expect(md).toContain("/llms.txt");
    expect(md.length).toBeGreaterThan(20);
  });
  test("llms.txt follows the format: H1, blockquote, H2 link lists", () => {
    const txt = llmsTxt([post]);
    const lines = txt.split("\n");
    expect(lines[0]).toBe("# Matt Litherland");
    expect(lines[2].startsWith("> ")).toBe(true);
    expect(txt).toContain("## Pages");
    expect(txt).toMatch(HOME_LINK);
  });
});

describe("JSON-LD", () => {
  const ld = homeJsonLd();
  const person = ld["@graph"][0] as Record<string, unknown>;
  test("Person with identity fields", () => {
    expect(ld["@context"]).toBe("https://schema.org");
    expect(person["@type"]).toBe("Person");
    expect(person.name).toBe("Matt Litherland");
    expect(person.url).toBe("https://uixmat.dev");
    expect(person.sameAs).toContain("https://github.com/uixmat");
    expect(person.knowsAbout).toContain("Cal.com");
  });
  test("script serialisation can't close the tag", () => {
    expect(jsonLdScript({ a: "</script><b>" })).not.toContain("</script>");
    expect(JSON.parse(jsonLdScript({ a: "</script>" }))).toEqual({
      a: "</script>",
    });
  });
});
