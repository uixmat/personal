# uixmat.dev — design spec

Version 2 · 15 Nov 2026 · replaces the Swiss/Bauhaus direction (v1), which was rejected.

## 1. What the site is

Matt Litherland's personal site. Three jobs, in order:

1. **Show the work.** Head of Product at Cal.com, author of Bklit UI. Before that, Product Engineer at Prisma.
2. **Show the person.** He lives in Bulgaria, under Pirin. He snowboards backcountry and rides a Santa Cruz Vala.
3. **Host the writing.** It's empty for now and must look intentional while empty.

The site should feel like **a field manual drawn by someone who builds instruments**. That means technical drawings and real data, set in warm mountain light, with grain and gradients you could almost touch. It should not look like a poster, a grid exercise, or a dashboard.

## 2. What changed from v1

| v1 (rejected) | v2 |
| --- | --- |
| Swiss/Bauhaus grid, flat paper, hairlines only | Grain, gradients, and geometric light sources over a deep night ground |
| Uppercase tracked mono labels everywhere | Sentence case. Mono is reserved for numbers in drawings and charts |
| Huge "uixmat" wordmark (Specimen) | No wordmark set as a graphic; the handle appears at text size only |
| Abstract subjects (capsule, logos on a plotter bed) | Real subjects: Cal's launches, Bklit charts, Pirin, the Vala, a rider in powder |
| Coss-adjacent construction drawing (two-circle capsule, u-dimensions) | Removed everywhere, including the current homepage figure |

**Kept from v1:** the **Pirin** scroll sequence (Europe → Pirin → contours → ridgelines with the Vihren trig point) and the **Patent** language (exploded parts, lead lines, dash-dot assembly axes).

## 3. Visual language

### 3.1 Light: gradient and grain

- **Ground.** The default ground is night: a deep blue-black, never pure black.
- **Light sources.** Gradients behave like light falling on a surface, never like decoration. Each section has at most one source: a low sun, alpenglow along a ridge, or snow glare. Use radial or conic gradients anchored to a geometric shape (§3.2), never a full-bleed rainbow.
- **Grain.** Every gradient gets grain, which also removes banding.
  - Build it once: a static SVG `feTurbulence` tile (`baseFrequency` ≈ 0.8, 3 octaves) as a fixed, `pointer-events: none` layer, with `mix-blend-mode: soft-light` at 6–12% opacity.
  - Grain never animates. Animated noise costs a repaint every frame and reads as video static.
- **Clean surfaces.** Text never sits on heavy grain. Reading surfaces are calm: grain at most 4%, and no gradient behind running text.

### 3.2 Geometry

- **Shapes.** There are three: the **circle** (sun, ring, the Tick ring chart), the **triangle** (peak, trig point), and the **line** (horizon, lead line, axis). Nothing else is decorative.
- **Edges and size.** Shapes are hard-edged and large, and can crop off the viewport edge. Their fill is the gradient light source, and their edge is crisp. They sit behind content and never carry text.
- **Load-bearing.** Shapes share their geometry with the data and the drawings: the sun circle is the Tick ring, and the triangle is the Vihren trig mark.

### 3.3 Drawings (Patent language, kept)

- **Lines.** Technical drawings use hairline strokes in the ink colour, with hierarchy shown by opacity.
- **Callouts.** Use lettered circle callouts (A, B, C…) in the accent colour on curved lead lines. This follows the Santa Cruz exploded-frame diagram Matt shared, replacing v1's serif numerals.
- **Axes.** Dash-dot assembly axes connect exploded parts.
- **Projection.** Views are orthographic (plan or axonometric), with no perspective.
- **Legend.** Lives beside the drawing, never inside it. Legend lines use real specs, e.g. "B — FOX Float X Factory, 150 mm".

### 3.4 Palette: "Alpenglow"

Defined in OKLCH. These are starting values, to be tuned in the prototype.

| Token | Dark (default) | Light | Role |
| --- | --- | --- | --- |
| `night` (paper) | `oklch(0.16 0.025 262)` | `oklch(0.975 0.006 240)` (snow) | Ground |
| `surface` | `oklch(0.20 0.03 262)` | `oklch(0.95 0.008 240)` | Cards, chart wells |
| `snow` (ink) | `oklch(0.96 0.008 240)` | `oklch(0.20 0.03 262)` | Text, drawing lines |
| `ink-2` / `ink-3` | 0.78 / 0.64 L, same hue | 0.40 / 0.52 L | Secondary and tertiary text |
| `rule` | `oklch(0.27 0.03 262)` | `oklch(0.88 0.01 240)` | Dividers, chart grid |
| `cobalt` | `oklch(0.56 0.16 256)` | same | Sky; second chart series |
| `signal` (accent) | `oklch(0.72 0.19 45)` | `oklch(0.64 0.19 42)` | The one thing that matters per view: callouts, the active series, the trig mark |
| `alpenglow` gradient | `signal` → `oklch(0.66 0.17 10)` → `oklch(0.45 0.13 300)` | — | Light sources only, never text |

- **Neutrals** carry the blue hue (262) so they agree with the night sky.
- **Signal orange** comes from the rider's jacket in the powder photo. Use it once per view.
- **Chart tokens.** Map Bklit's `--chart-1…5` to signal, cobalt, snow, ink-3 and alpenglow-violet. Map `--chart-negative` to a cool desaturated blue, not red.

### 3.5 Type

Geist only. All three families are licensed and installed.

- **Geist Sans** for UI and display.
  - Display sizes use weight 500–600, tracking −0.03 to −0.045em, and sentence case.
  - The name sets at a confident size, not poster size.
- **Geist Serif** for the voice: the one-line intro, project standfirsts, pull quotes, and all writing body text (19px, 1.65 line height, 65ch measure).
- **Geist Mono** only for numbers: chart axes, drawing legends, specs, dates. Always `tabular-nums`, always sentence case, and never letter-spaced.
- **No all-caps anywhere.** That was the Swiss tell.

## 4. Information architecture

One long home page with five sections, plus `/writing`. Only **two** sections are pinned scroll sequences; everything else scrolls normally.

### 4.1 Hero: name and place

- **Copy.** "Matt Litherland" in Sans display, then one Serif line: *Head of Product at Cal.com. Author of Bklit UI. Living under Pirin, Bulgaria.*
- **Visual.** The **Pirin sequence**, pinned for at most 220vh, set against an alpenglow light source that sits low behind the ridgelines.
  - The first frame is complete (Europe, with Bulgaria marked in signal).
  - The Vihren trig triangle is the same triangle used as the page's geometric motif.

### 4.2 Cal.com: the launches (pinned, Patent language)

- **The subject.** On 16 Nov 2026 Cal.com launches five products. Matt led all five as Head of Product.
- **The drawing.** Scroll scrubs a patent sheet. FIG. 1 shows Cal as one assembled product. FIG. 2 explodes it into five lettered parts on dash-dot axes, with the legend typing in beside it:
  - **A Cal.ai:** agentic, context-aware assistant
  - **B Cal Events**
  - **C Cal Discover:** services people list on their Cal become discoverable
  - **D Cal Desktop**
  - **E Cal Mobile**
- **After the drawing.** One Serif paragraph on what "Head of Product" meant across the five, then a link out.
- **Drawing only.** No numbers or charts in the Cal section (decided 15 Nov 2026).

### 4.3 Bklit: the charts are the content

This section is a live showcase. Every chart is a real Bklit component installed from the registry (`npx shadcn add @bklit/<name>`) and fed **real data** (§5).

- **Seasonal temperature card** (`radial-chart`): Bansko's year wrapped into a loop. Daily mean, normal band and record band, 1999–2025.
- **Year over year** (`line-chart` + `band`): Bansko snowfall this season vs last, with the gap filled. The orange series is this winter.
- **Tick ring** (`pie-chart` / ring recipe): days into the 2026–27 season. The ring is the sun circle from §3.2.
- **Projected goal** (`projection-line`): Bklit UI GitHub stars, projected to the next goal. Goals are 3K, then 4K, then 5K; after 5K they step by 5K (10K, 15K…). The goal moves up automatically at build time once it's passed.
- **Signal & noise** (`composed-chart`): daily GitHub contributions over a smoothed trend.
- **Gap fill** (`area-chart` + `band`): Onborda weekly npm downloads against their trend.

Lay them out as a loose mosaic of cards on the night ground. Each card gets its own grain and light source. No scroll pinning; charts animate on their own entrance once (Bklit's built-in chart animation) and respond to hover.

### 4.4 Previously

- **Prisma:** Product Engineer.
- **Open-source list:** Onborda (1.4k★), shadcn-country-dropdown, Firestarta.
- **Treatment:** quiet rows. Sans name, Serif standfirst, Mono figures. No visuals.

### 4.5 Off the clock (pinned, the second and last pinned sequence)

The Patent language returns, this time pointed at the mountains.

- **The Vala.** An exploded axonometric of the Santa Cruz Vala XX AXS Lite RSV frame, in the style of Santa Cruz's own diagram, with lettered callouts:
  - **A** Carbon CC frame
  - **B** FOX 36 Float Factory, 160 mm
  - **C** FOX Float X Factory, 150 mm
  - **D** Bosch Performance CX
  - **E** SRAM XX Eagle AXS T-Type
  - **F** SRAM Maven Silver, 200 mm rotors
  - **G** Reserve 30|HD Carbon
  - **H** 20.64 kg
- **Powder.** A rider drawn as a geometric diagram: board, body line and arms as straight segments. The snow burst is a particle field.
  - Scroll scrubs the burst outward, seeded and deterministic.
  - Signal orange marks the rider and nothing else.
  - Reduced motion shows the burst static, mid-explosion.

### 4.6 Writing

- **Index.** Serif titles, Mono dates.
- **Empty state.** One Serif sentence ("Nothing published yet — the first essay is on its way") with an RSS link, over a single quiet light source.

## 5. Data rules

1. **Every chart is real.** Its source sits in the card footer in Mono (e.g. "Open-Meteo archive · 41.84°N 23.49°E · 1999–2025").
2. **Built at build time, never live.** A script fetches data into `public/data/*.json`, and pages read static JSON. This is the same pattern as `scripts/build-geo.mjs`.
3. **Sources:**
   - **Bansko weather:** Open-Meteo archive API, no key needed (checked working).
   - **GitHub stars and contributions:** GitHub API.
   - **Onborda downloads:** npm downloads API.
4. **Goals and targets come from Matt, never from a guess.** The Bklit star goal and anything about Cal need his numbers.

## 6. Motion rules

1. **Two pinned sequences, maximum:** Pirin (hero) and Off the clock. Cal's patent sheet also scrubs, but it is unpinned and runs over the section's natural scroll height.
2. **Scrubbed motion has no duration or easing;** progress maps one to one. Entrance motion runs once, with ease-out over 400–600ms.
3. **One thing moves at a time** inside a drawing: parts separate, *then* axes appear, *then* callouts.
4. **The grain is static,** and light sources may drift with scroll by 5% at most. Nothing loops on its own.
5. **Reduced motion:** sequences show their final, labelled state statically, entrances fade only, and the particle burst freezes.
6. **Animate only transform and opacity.** Three.js covers Pirin and the particle burst; everything else is SVG and CSS.

## 7. Components and stack

- **Framework:** Next.js 16 (App Router, Cache Components), Tailwind v4, Ultracite (Biome).
- **Charts:** Bklit UI through the shadcn registry, which pulls in d3, Motion and Base UI.
- **Icons:** Central Icons, `central-icons` alias, square-outlined, 1.5 stroke. Brand marks come from Simple Icons only where Central has none (Cal.com, Prisma).
- **3D:** `three` + `@react-three/fiber`, orthographic cameras only.
- **Fonts:** `geist` (Sans, Serif, Mono).

## 8. Portrait

Matt's studio portrait (black tee, clear frames, neutral backdrop) appears once, in the hero beside the intro.

- **Treatment:** the photo keeps its natural colour. The same grain layer sits over it (soft-light, 8%), and a soft alpenglow light source on the night ground behind it makes the neutral backdrop belong to the page.
- **Shape:** the frame is a circle (the §3.2 sun shape), cropped on the face, with no border or shadow.
- **Variety:** this is the only photograph on the site. Everything else is drawn.

## 9. Decisions log

- 15 Nov 2026: Cal section is drawing-only. The Bklit star goal ladder is 3K → 4K → 5K → +5K steps. The Strava heatmap is pending API credentials (client ID, secret, refresh token); Off the clock ships without it until then. Prototypes cover the whole page, not just the hero.
- 15 Nov 2026, first build of the whole page:
  - **Pinning.** The two pinned sequences are the hero (Pirin) and **Cal**, not Off the clock. The launches carry more weight than the bike. Off the clock scrubs each figure as it crosses the viewport instead.
  - **Phones.** Below 1024px Cal unpins, because the sheet is taller than the viewport, and its explosion scrubs on the figure instead.
  - **Snow data.** Snowfall is measured at the ski area (41.795°N 23.43°E, 2000 m). Bansko town at 914 m gets about a tenth of the snow.
  - **Vala drawing.** The Vala elevation is hand-built and approximate; trace it from Santa Cruz's geometry chart before shipping.
- 15 Nov 2026, second prototype round (/proto/page):
  - **Kept:** the Poster direction (giant heavy outline type that fills on scroll).
  - **Rejected:** Specimen (spec-sheet panel grid, too close to Vercel's own look) and Editorial (serif-led, too quiet).
  - **Applied directly:** monotone palette, no "Previously" section, the Vercel OSS Program badge on Bklit, location Veliko Tarnovo (time in Pirin/Bansko), square chart cards, NumberFlow readouts on every stat chart, and visible Central icons.
- Riff round: Poster centred on visible guides, with horizontal and vertical lines, "+" crosses where they meet, and diagonal hatching. It adds:
  - the Bklit changelog rail as a section ticker
  - a 3D scroll wheel for the winter setup
  - a full-viewport Pirin map with difference-blended type
  - componentry's ASCII effect for photos
- Variants differ only in guide density, hatch placement and fill direction.

- 15 Nov 2026, promoted to `/` from /proto/page (prototype deleted):
  - **Layout:** Poster on the "Grid" guide system — six columns, "+" crosses, sky-tinted hairlines, centre three rails at 20%, hatching on Cal and Off the clock, outline type filling left-to-right. The hero has no rails; the full-viewport map is its structure.
  - **Photos:** "Mono" — grayscale, contrast 1.6, light grain. Rejected: ASCII (faces lost), Grain (only colour on the page), Reveal (hidden on touch).
  - **Winter setup:** 3D scroll wheel, no hover cards (rejected as distracting).
  - **Charts:** every time-series chart uses `TOOLTIP_STYLE` (`src/components/home/flow-tooltip.tsx`) and the dot-matrix background, and stays ≤ 60 points so Bklit keeps the crosshair spring and pill roll (above 60 it switches to static "discrete" mode).
  - **Nav wordmark:** UIXMAT. Footer: © year + logo-only socials.
- 15 Nov 2026, performance and agent readiness:
  - **Hero poster:** the hero's first frame is an image (`pirin-poster.png`). Three.js loads on first scroll, pointer or key press. Charts mount within 600px of the viewport. Lighthouse went from 70 to 100, and TBT from 2.8s to 30ms.
  - **Winter wheel:** only the focused item is real content (a link). Rotated items draw their text with CSS `content`, and an sr-only list carries all seven products.
  - **Agents:** Markdown negotiation, Markdown 404s, llms.txt, sitemap, robots and Person JSON-LD.

