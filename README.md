# uixmat.dev

Matt Litherland's personal site. Next.js 16, Tailwind v4, Motion, Three.js, and [Bklit UI](https://bklit.com) charts. The design spec and decisions log live in [`DESIGN.md`](DESIGN.md).

## Develop

```bash
CENTRAL_LICENSE_KEY=… bun install   # Central Icons is a licensed package
bun run dev
bun run check                        # Ultracite (Biome)
```

## Data

The charts and the Pirin map read static files, refreshed by script:

```bash
bun scripts/build-data.mjs   # Bansko weather, GitHub stars/contributions, npm downloads → src/data
bun scripts/build-geo.mjs    # Europe outlines + Pirin heightmap → public/geo
```

## Writing

Posts are MDX in `src/content/writing`. Export `metadata` (`title`, `summary`, `date`, optional `draft`); drafts only render in development.
