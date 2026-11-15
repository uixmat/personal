"use client";

import {
  type MotionValue,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import type { ElementType, ReactNode, RefObject } from "react";

/** Scroll progress for a pinned track (start→end), or 1 under reduced motion. */
export function usePinned(ref: RefObject<HTMLElement | null>) {
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const still = useMotionValue(1);
  return { progress: reduced ? still : scrollYProgress, reduced };
}

/** Progress while an element crosses the viewport. */
export function useCrossing(
  ref: RefObject<HTMLElement | null>,
  offset:
    | ["start 0.9", "center 0.45"]
    | ["start 0.85", "start 0.35"]
    | ["start end", "end start"] = ["start 0.9", "center 0.45"]
) {
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset });
  const still = useMotionValue(1);
  return reduced ? still : scrollYProgress;
}

/**
 * Outline via an SVG morphology filter rather than -webkit-text-stroke: the
 * filter erodes the filled glyphs' alpha, so overlapping contours (Geist's
 * variable outlines, kerned "tt") merge instead of drawing inner lines.
 */
const STROKE = "text-ink [filter:url(#outline)]";

export function OutlineDefs() {
  return (
    <svg aria-hidden="true" className="pointer-events-none absolute size-0">
      <filter id="outline">
        <feMorphology
          in="SourceAlpha"
          operator="erode"
          radius="1.4"
          result="inner"
        />
        <feComposite in="SourceGraphic" in2="inner" operator="out" />
      </filter>
    </svg>
  );
}

/** Heavy outline type that fills solid from the baseline up as `fill` goes 0 → 1. */
export type FillFrom = "bottom" | "left" | "top";

export function OutlineFill({
  children,
  fill,
  from = "bottom",
  as: Tag = "span",
  className = "",
  id,
}: {
  children: ReactNode;
  /** Goes on the wrapper, so the duplicated fill layer never repeats an id. */
  id?: string;
  fill: MotionValue<number>;
  from?: FillFrom;
  as?: ElementType;
  className?: string;
}) {
  const inset = useTransform(fill, (f) => `${(1 - f) * 100}%`);
  const edges = {
    bottom: useMotionTemplate`inset(${inset} 0 0 0)`,
    top: useMotionTemplate`inset(0 0 ${inset} 0)`,
    left: useMotionTemplate`inset(0 ${inset} 0 0)`,
  };
  const clip = edges[from];
  return (
    <Tag className={`relative block ${className}`} id={id}>
      <span className={`block ${STROKE}`}>{children}</span>
      <motion.span
        aria-hidden="true"
        className="text-ink absolute inset-0 block"
        style={{ clipPath: clip }}
      >
        {children}
      </motion.span>
    </Tag>
  );
}

export function Outline({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <span className={`${STROKE} ${className}`}>{children}</span>;
}
