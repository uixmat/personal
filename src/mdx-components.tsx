import type { MDXComponents } from "mdx/types";

const components: MDXComponents = {
  h2: (props) => (
    <h2
      className="text-ink mt-14 mb-4 font-sans text-2xl font-medium tracking-tight"
      {...props}
    />
  ),
  h3: (props) => (
    <h3
      className="text-ink mt-10 mb-3 font-sans text-lg font-medium"
      {...props}
    />
  ),
  p: (props) => <p className="mb-[1.6em] [text-wrap:pretty]" {...props} />,
  a: (props) => (
    <a
      className="text-ink decoration-rule-strong hover:decoration-ink underline underline-offset-4 transition-colors duration-150"
      {...props}
    />
  ),
  ul: (props) => <ul className="mb-[1.6em] list-disc pl-5" {...props} />,
  ol: (props) => <ol className="mb-[1.6em] list-decimal pl-5" {...props} />,
  blockquote: (props) => (
    <blockquote
      className="border-signal text-ink mb-[1.6em] border-l pl-5"
      {...props}
    />
  ),
  code: (props) => (
    <code className="text-ink font-mono text-[0.875em]" {...props} />
  ),
  pre: (props) => (
    <pre
      className="border-rule bg-surface mb-[1.6em] overflow-x-auto border p-5 font-mono text-sm leading-relaxed"
      {...props}
    />
  ),
  hr: () => <hr className="border-rule my-12" />,
};

export function useMDXComponents(): MDXComponents {
  return components;
}
