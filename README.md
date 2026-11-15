# uixmat.dev

Matt Litherland's personal site. Next.js 16, Tailwind v4, Motion, Three.js, and [Bklit UI](https://bklit.com) charts. The design spec and decisions log live in [`DESIGN.md`](DESIGN.md).

## Develop

```bash
CENTRAL_LICENSE_KEY=… bun install   # Central Icons is a licensed package
bun run dev
bun run check                        # Ultracite (Biome)
bun run test                         # unit tests (bun test)
```

## Data

The charts and the Pirin map read static files, refreshed by script:

```bash
bun scripts/build-data.mjs   # Bansko weather, GitHub stars/contributions, npm downloads → src/data
bun scripts/build-geo.mjs    # Europe outlines + Pirin heightmap → public/geo
```

## Writing

Posts are MDX in `src/content/writing`. Export `metadata` (`title`, `summary`, `date`, optional `draft`); drafts only render in development.

## For agents

Every page has a Markdown version: append `.md` (`/index.md`, `/writing.md`) or send `Accept: text/markdown` (handled in `src/proxy.ts`, served by `src/app/md`). Unknown paths return a Markdown 404. Also: `/llms.txt`, `/sitemap.xml`, `/robots.txt`, and Person JSON-LD on the home page (`src/lib/agent.ts`).

## Hero poster

The hero's first frame ships as `public/images/pirin-poster.png` and WebGL loads on first interaction. If the map styling changes, re-render the poster from the WebGL scene at 1600×3520.
