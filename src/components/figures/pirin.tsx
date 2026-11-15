"use client";

import {
  type MotionValue,
  motion,
  useMotionValue,
  useTransform,
} from "motion/react";
import dynamic from "next/dynamic";
import { useRef } from "react";
import { MONOTONE } from "./palette";

const Scene = dynamic(() => import("./pirin-scene").then((m) => m.PirinScene), {
  ssr: false,
});

const note = "font-mono text-ink-3 text-xs tabular-nums";

/** Europe → Pirin, from flat map to a ridgeline block diagram. Scrubbed by `progress`. */
export function Pirin({ progress }: { progress: MotionValue<number> }) {
  const scale = useRef<HTMLDivElement>(null);
  const scaleLabel = useRef<HTMLSpanElement>(null);
  const trig = useRef<HTMLDivElement>(null);
  const exaggeration = useMotionValue(10);

  const contourNote = useTransform(
    progress,
    [0.47, 0.55, 0.68, 0.76],
    [0, 1, 1, 0]
  );
  const relief = useTransform(progress, [0.86, 0.94], [0, 1]);

  return (
    <>
      <div className="absolute inset-0">
        <Scene
          exaggeration={exaggeration}
          overlay={{ scale, scaleLabel, trig }}
          palette={MONOTONE}
          progress={progress}
        />
      </div>
      <div className="absolute bottom-0 left-0 flex flex-col gap-2">
        <span className={note} ref={scaleLabel} />
        <div className="border-ink-2 h-1.5 border-x border-b" ref={scale} />
      </div>
      <div className="absolute right-0 bottom-0 flex flex-col items-end gap-1">
        <motion.span className={note} style={{ opacity: contourNote }}>
          100 m contours
        </motion.span>
        <motion.span className={note} style={{ opacity: relief }}>
          10× vertical exaggeration
        </motion.span>
      </div>
      <div className="absolute top-0 left-0" ref={trig}>
        <motion.div
          className="flex -translate-x-1/2 -translate-y-full flex-col items-center"
          style={{ opacity: relief }}
        >
          <span className="bg-night/80 text-ink rounded-full px-2.5 py-1 text-xs whitespace-nowrap backdrop-blur-sm">
            Vihren{" "}
            <span className="text-ink-3 font-mono tabular-nums">2914 m</span>
          </span>
          <span className="bg-ink-2 h-14 w-px" />
          <svg
            aria-hidden="true"
            className="size-3 overflow-visible"
            viewBox="0 0 12 12"
          >
            <path d="M6 1 L11 10 H1 Z" fill="none" stroke="var(--color-sky)" />
            <circle cx={6} cy={7} fill="var(--color-sky)" r={1.2} />
          </svg>
        </motion.div>
      </div>
    </>
  );
}
