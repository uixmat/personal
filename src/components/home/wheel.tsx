"use client";

import { IconArrowUpRight } from "central-icons";
import {
  type MotionValue,
  motion,
  useMotionValueEvent,
  useTransform,
} from "motion/react";
import { useState } from "react";
import type { SetupItem } from "./content";

const STEP = 26; // degrees between items on the drum
const RADIUS = "11rem";

/**
 * A scroll-driven drum: items sit on a cylinder in 3D, the drum turns with
 * scroll, and items blur and dim as they rotate away from the reader.
 */
export function Wheel({
  items,
  progress,
}: {
  items: SetupItem[];
  progress: MotionValue<number>;
}) {
  const active = useTransform(progress, [0.08, 0.92], [0, items.length - 1]);
  const [focus, setFocus] = useState(0);
  useMotionValueEvent(active, "change", (a) => setFocus(Math.round(a)));
  return (
    <div className="relative w-full">
      <div className="relative h-[30rem] w-full [mask-image:linear-gradient(transparent,black_22%,black_78%,transparent)] [perspective:1000px]">
        <div className="absolute inset-0 [transform-style:preserve-3d]">
          {items.map((it, i) => (
            <Item
              active={active}
              focused={i === focus}
              index={i}
              item={it}
              key={it.name}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function Item({
  item,
  index,
  active,
  focused,
}: {
  item: SetupItem;
  index: number;
  active: MotionValue<number>;
  focused: boolean;
}) {
  const angle = useTransform(active, (a) => (index - a) * STEP);
  const transform = useTransform(
    angle,
    (deg) => `translateY(-50%) rotateX(${-deg}deg) translateZ(${RADIUS})`
  );
  // Rounded so server and client serialise identical inline styles.
  const opacity = useTransform(
    angle,
    (deg) =>
      Math.round(Math.max(0, Math.cos((deg * Math.PI) / 180) ** 3) * 1000) /
      1000
  );
  // Sharp within a few degrees of centre, so the active item never looks soft mid-scroll.
  const filter = useTransform(
    angle,
    (deg) =>
      `blur(${Math.round(Math.min(8, Math.max(0, Math.abs(deg) - 5) / 5) * 100) / 100}px)`
  );
  const visibility = useTransform(angle, (deg) =>
    Math.abs(deg) > 80 ? "hidden" : "visible"
  );

  return (
    <motion.a
      className="group absolute inset-x-0 top-1/2 flex flex-col items-center gap-2 text-center [backface-visibility:hidden]"
      href={item.href}
      rel="noopener"
      style={{ transform, opacity, filter, visibility }}
      tabIndex={focused ? 0 : -1}
      target="_blank"
    >
      <span className="text-ink-3 text-sm">{item.role}</span>
      <span className="text-ink flex items-center gap-2 text-[clamp(2rem,4.6vw,4.25rem)] leading-none font-black tracking-[-0.045em]">
        {item.name}
        <IconArrowUpRight
          aria-hidden="true"
          className="text-ink-3 ease-out-strong group-hover:text-ink size-6 transition-[color,transform] duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
      </span>
    </motion.a>
  );
}
