"use client";

import {
  type MotionValue,
  motion,
  useMotionValue,
  useTransform,
} from "motion/react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import poster from "../../../public/images/pirin-poster.png";
import { MONOTONE } from "./palette";

const Scene = dynamic(() => import("./pirin-scene").then((m) => m.PirinScene), {
  ssr: false,
});

const WAKE_EVENTS = [
  "scroll",
  "pointermove",
  "pointerdown",
  "touchstart",
  "keydown",
  "wheel",
] as const;

/**
 * Three.js (~950 KB) isn't needed for the first frame — the flat Europe map —
 * so that frame ships as an image and WebGL loads on the first interaction.
 */
function useWake(progress: MotionValue<number>) {
  const [awake, setAwake] = useState(false);
  useEffect(() => {
    // Restored mid-scroll, or reduced motion (progress pinned to the end): wake now.
    if (progress.get() > 0) {
      setAwake(true);
      return;
    }
    const wake = () => setAwake(true);
    for (const e of WAKE_EVENTS) {
      window.addEventListener(e, wake, { once: true, passive: true });
    }
    return () => {
      for (const e of WAKE_EVENTS) {
        window.removeEventListener(e, wake);
      }
    };
  }, [progress]);
  return awake;
}

const note = "font-mono text-ink-3 text-xs tabular-nums";

/** Europe → Pirin, from flat map to a ridgeline block diagram. Scrubbed by `progress`. */
export function Pirin({ progress }: { progress: MotionValue<number> }) {
  const scale = useRef<HTMLDivElement>(null);
  const scaleLabel = useRef<HTMLSpanElement>(null);
  const trig = useRef<HTMLDivElement>(null);
  const exaggeration = useMotionValue(10);
  const awake = useWake(progress);
  const [ready, setReady] = useState(false);
  const onReady = useCallback(() => setReady(true), []);

  // Scale bar for the poster frame — same maths as the scene's first frame.
  useEffect(() => {
    const host = scale.current?.parentElement?.parentElement;
    if (!(host && scale.current && scaleLabel.current)) {
      return;
    }
    const zoom = host.clientWidth / 3400;
    const km = 140 / zoom;
    const pow = 10 ** Math.floor(Math.log10(km));
    const n = km / pow;
    const nice = (n >= 5 ? 5 : 1) * (n >= 2 && n < 5 ? 2 : 1) * pow;
    scale.current.style.width = `${nice * zoom}px`;
    scaleLabel.current.textContent = `${nice} km`;
  }, []);

  const contourNote = useTransform(
    progress,
    [0.47, 0.55, 0.68, 0.76],
    [0, 1, 1, 0]
  );
  const relief = useTransform(progress, [0.86, 0.94], [0, 1]);

  return (
    <>
      {/* Width-locked like the orthographic camera, so it lines up with the first WebGL frame. */}
      <Image
        alt=""
        aria-hidden="true"
        className="absolute top-1/2 left-0 h-auto w-full -translate-y-1/2 transition-opacity duration-300"
        fetchPriority="high"
        loading="eager"
        sizes="100vw"
        src={poster}
        style={{ opacity: ready ? 0 : 1 }}
      />
      <div className="absolute inset-0">
        {awake ? (
          <Scene
            exaggeration={exaggeration}
            onReady={onReady}
            overlay={{ scale, scaleLabel, trig }}
            palette={MONOTONE}
            progress={progress}
          />
        ) : null}
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
