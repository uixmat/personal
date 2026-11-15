"use client";

import type { ReactNode } from "react";

/** One guide system per variant: vertical rails, section rules, "+" crosses, hatched regions. */
export interface GuideSystem {
  /** Where crosses sit on each section's top rule: at every rail, or only the outer two */
  crosses: "all" | "outer";
  /** Hatched regions as [left, right] CSS positions, drawn in `hatched` sections */
  hatch: [string, string][];
  /** Per-rail opacity (defaults to 1) — e.g. quieter inner rails */
  railOpacity?: number[];
  /** Vertical rail positions as CSS `left` values */
  rails: string[];
}

const PLUS = (
  <svg
    aria-hidden="true"
    className="absolute size-[11px] -translate-x-1/2 -translate-y-1/2 text-[color-mix(in_oklch,var(--color-sky)_70%,var(--color-ink-3))]"
    viewBox="0 0 11 11"
  >
    <path d="M5.5 0v11M0 5.5h11" stroke="currentColor" strokeWidth={1} />
  </svg>
);

/** Guide lines: the rule colour with the faintest lean toward sky. */
const LINE = "bg-[color-mix(in_oklch,var(--color-sky)_12%,var(--color-rule))]";

const HATCH =
  "bg-[repeating-linear-gradient(-45deg,color-mix(in_oklch,var(--color-sky)_10%,transparent)_0_1px,transparent_1px_9px)]";

/** Draws the guides behind a section; children sit above. */
export function Guided({
  system,
  hatched = false,
  rule = true,
  className = "",
  children,
  ...rest
}: {
  system: GuideSystem;
  hatched?: boolean;
  rule?: boolean;
  className?: string;
  children: ReactNode;
} & React.HTMLAttributes<HTMLElement>) {
  const crossAt =
    system.crosses === "all"
      ? system.rails
      : [system.rails[0], system.rails.at(-1) ?? "100%"];
  return (
    <section className={`relative ${className}`} {...rest}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
      >
        {hatched
          ? system.hatch.map(([l, r]) => (
              <div
                className={`absolute inset-y-0 ${HATCH}`}
                key={l}
                style={{ left: l, right: `calc(100% - ${r})` }}
              />
            ))
          : null}
        {system.rails.map((x, i) => (
          <div
            className={`absolute inset-y-0 w-px ${LINE}`}
            key={x}
            style={{ left: x, opacity: system.railOpacity?.[i] ?? 1 }}
          />
        ))}
        {rule ? (
          <div className={`absolute inset-x-0 top-0 h-px ${LINE}`} />
        ) : null}
        {rule
          ? crossAt.map((x) => (
              <div
                className="absolute top-0"
                key={x}
                style={{
                  left: x,
                  opacity: Math.max(
                    0.35,
                    system.railOpacity?.[system.rails.indexOf(x)] ?? 1
                  ),
                }}
              >
                {PLUS}
              </div>
            ))
          : null}
      </div>
      <div className="relative z-10">{children}</div>
    </section>
  );
}
