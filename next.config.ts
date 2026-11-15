import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  // Pages have HTML and Markdown representations (see src/proxy.ts), so caches
  // must key on Accept.
  headers() {
    return Promise.resolve([
      {
        source: "/:path((?!_next/).*)",
        headers: [{ key: "Vary", value: "Accept" }],
      },
    ]);
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

const withMDX = createMDX({});

export default withMDX(nextConfig);
