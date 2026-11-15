"use client";

// Adapted from Bklit's changelog rail (bklit/bklit-ui, ChangelogRail): the
// "compressed lines" scroll-spy, here tracking sections of the page.
import {
  AnimatePresence,
  type MotionValue,
  motion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { type PointerEvent, useCallback, useEffect, useState } from "react";

const LINE_COUNT = 36;
const PULL = 0.8;
const SPREAD = 0.15;

function warp(position: number, focus: number) {
  const offset = position - focus;
  const u = offset / SPREAD;
  return position - PULL * offset * Math.exp(-u * u);
}

function emphasis(position: number, focus: number) {
  const u = (position - focus) / 0.1;
  return round(0.16 + 0.6 * Math.exp(-u * u));
}

function round(value: number) {
  return Math.round(value * 1000) / 1000;
}

/** Scroll the page to the fraction of the rail under the pointer. */
function scrubTo(e: PointerEvent<HTMLDivElement>) {
  const r = e.currentTarget.getBoundingClientRect();
  const fraction = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
  const max = document.documentElement.scrollHeight - window.innerHeight;
  window.scrollTo({ top: fraction * max, behavior: "instant" });
}

const positions = Array.from(
  { length: LINE_COUNT },
  (_, i) => i / (LINE_COUNT - 1)
);

function RailLine({
  position,
  focus,
}: {
  position: number;
  focus: MotionValue<number>;
}) {
  const y = useTransform(focus, (f) => `${round(warp(position, f) * 100)}%`);
  const opacity = useTransform(focus, (f) => emphasis(position, f));
  return (
    <motion.div className="absolute inset-0" style={{ y }}>
      <motion.div className="bg-ink h-px w-4" style={{ opacity }} />
    </motion.div>
  );
}

/** Fixed scroll-spy: lines bunch around the reader's position, section name alongside. */
export function SectionRail({
  sections,
}: {
  sections: { id: string; label: string }[];
}) {
  const { scrollYProgress } = useScroll();
  const focus = useSpring(scrollYProgress, {
    stiffness: 260,
    damping: 40,
    mass: 0.4,
  });
  const labelY = useTransform(focus, (f) => `${round(f * 100)}%`);
  const [label, setLabel] = useState(sections[0]?.label);

  useEffect(() => {
    const update = () => {
      const mid = window.innerHeight * 0.4;
      let current = sections[0]?.label;
      for (const s of sections) {
        const el = document.querySelector(`#${CSS.escape(s.id)}`);
        if (el && el.getBoundingClientRect().top <= mid) {
          current = s.label;
        }
      }
      setLabel(current);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [sections]);

  const onPointerDown = useCallback((e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    scrubTo(e);
  }, []);
  const onPointerMove = useCallback((e: PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      scrubTo(e);
    }
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed top-1/2 left-5 z-30 hidden h-[52vh] w-32 -translate-y-1/2 cursor-grab touch-none mix-blend-difference select-none lg:block"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
    >
      {positions.map((p) => (
        <RailLine focus={focus} key={p} position={p} />
      ))}
      <motion.div className="absolute inset-0 left-7" style={{ y: labelY }}>
        <div className="relative -translate-y-1/2">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.span
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              className="text-ink block text-sm font-medium whitespace-nowrap"
              exit={{ opacity: 0, y: -6, filter: "blur(2px)" }}
              initial={{ opacity: 0, y: 6, filter: "blur(2px)" }}
              key={label}
              transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            >
              {label}
            </motion.span>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
