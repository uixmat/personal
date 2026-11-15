"use client";

import {
  IconCompassRound,
  IconMountainBike,
  IconPhoneDynamicIsland,
  IconSnowFlakes,
  IconSparkle,
  IconStudioDisplay,
  IconTicket,
} from "central-icons";
import { type MotionValue, motion, useTransform } from "motion/react";
import Image from "next/image";
import { type ComponentType, type ReactNode, useRef } from "react";
import { Pirin } from "@/components/figures/pirin";
import portrait from "../../../public/images/matt.jpg";
import { LAUNCHES, SETUP, VALA_SPECS } from "./content";
import { Guided, type GuideSystem } from "./guides";
import { Photo } from "./photo";
import { SectionRail } from "./rail";
import { type FillFrom, OutlineFill, useCrossing, usePinned } from "./type";
import { Wheel } from "./wheel";

interface PosterConfig {
  fillFrom: FillFrom;
  /** Which sections get diagonal hatching in the guide system's hatch regions */
  hatched: ("hero" | "launches" | "setup" | "life")[];
  system: GuideSystem;
}

const giant = "font-black uppercase leading-[0.8] tracking-[-0.055em]";
const column = "mx-auto w-full max-w-[1120px] px-6 md:px-10";

const ICONS: Record<
  string,
  ComponentType<{ className?: string; "aria-hidden"?: boolean }>
> = {
  "Cal AI": IconSparkle,
  "Cal Events": IconTicket,
  "Cal Discover": IconCompassRound,
  "Cal Desktop": IconStudioDisplay,
  "Cal Mobile": IconPhoneDynamicIsland,
};

const SECTIONS = [
  { id: "hero", label: "Pirin" },
  { id: "cal", label: "Cal.com" },
  { id: "bklit", label: "Bklit" },
  { id: "setup", label: "Winter setup" },
  { id: "life", label: "Off the clock" },
  { id: "writing", label: "Writing" },
];

/** Poster, centred on a visible guide system. Variants change only `config`. */
// Decided 15 Nov 2026: the "Grid" guide system — six columns, quieter centre rails.
const COL = (k: number) => `calc(24px + (100% - 48px) * ${k} / 6)`;
const GRID: PosterConfig = {
  system: {
    rails: [0, 1, 2, 3, 4, 5, 6].map(COL),
    crosses: "all",
    railOpacity: [1, 1, 0.2, 0.2, 0.2, 1, 1],
    hatch: [
      [COL(0), COL(1)],
      [COL(5), COL(6)],
    ],
  },
  fillFrom: "left",
  hatched: ["launches", "life"],
};

export function HomePage({
  bklit,
  writing,
}: {
  bklit: ReactNode;
  writing: ReactNode;
}) {
  const config = GRID;
  const { system, hatched } = config;
  return (
    <main className="bg-night overflow-x-clip">
      <SectionRail sections={SECTIONS} />
      <Hero config={config} />
      <Launches config={config} />
      <Guided id="bklit-wrap" system={system}>
        {bklit}
      </Guided>
      <Setup config={config} />
      <Life config={config} />
      <Guided hatched={hatched.includes("life")} id="writing" system={system}>
        {writing}
      </Guided>
    </main>
  );
}

function Hero({ config }: { config: PosterConfig }) {
  const track = useRef<HTMLElement>(null);
  const { progress, reduced } = usePinned(track);
  // One thing at a time: the name fills first, then the flight to Vihren.
  const fill = useTransform(progress, [0, 0.2], [0, 1]);
  const flight = useTransform(progress, [0.2, 1], [0, 1]);

  return (
    <section
      aria-label="Introduction"
      className={reduced ? "relative" : "relative h-[280vh]"}
      id="hero"
      ref={track}
    >
      <div className="sticky top-0 h-dvh min-h-[640px] overflow-hidden">
        {/* The map fills the viewport; type sits on it with a difference blend. */}
        <div className="pointer-events-none absolute inset-0 select-none">
          <Pirin progress={flight} />
        </div>
        <div className="h-full">
          {/* Only the type blends; the avatar sits solid on top of the map. */}
          <div className="flex h-dvh min-h-[640px] flex-col items-center justify-center gap-8 px-6 text-center">
            <Image
              alt="Matt Litherland"
              className="ring-night relative z-10 size-16 rounded-full object-cover ring-4 grayscale"
              placeholder="blur"
              priority
              sizes="64px"
              src={portrait}
            />
            <h1
              className={`${giant} text-[clamp(3.5rem,13.5vw,14rem)] mix-blend-difference`}
            >
              <OutlineFill fill={fill} from={config.fillFrom}>
                Matt
              </OutlineFill>
              <OutlineFill fill={fill} from={config.fillFrom}>
                Litherland
              </OutlineFill>
            </h1>
            <p className="text-ink max-w-[34ch] font-serif text-xl [text-wrap:balance] mix-blend-difference">
              Head of Product at Cal.com. Author of Bklit UI. Based in Veliko
              Tarnovo, mostly found in Pirin.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Word({
  name,
  note,
  from,
}: {
  name: string;
  note: string;
  from: FillFrom;
}) {
  const ref = useRef<HTMLLIElement>(null);
  const fill = useCrossing(ref, ["start 0.85", "start 0.35"]);
  const noteIn = useTransform(fill, [0.6, 1], [0, 1]);
  const Icon = ICONS[name];
  return (
    <li className="flex flex-col items-center gap-4 py-8 text-center" ref={ref}>
      <OutlineFill
        className={`${giant} text-[clamp(3rem,10.5vw,10.5rem)]`}
        fill={fill}
        from={from}
      >
        {name}
      </OutlineFill>
      <OpacityNote opacity={noteIn}>
        {Icon ? (
          <Icon aria-hidden className="text-ink size-5 shrink-0" />
        ) : null}
        {note}
      </OpacityNote>
    </li>
  );
}

function OpacityNote({
  children,
  opacity,
}: {
  children: ReactNode;
  opacity: MotionValue<number>;
}) {
  return (
    <motion.p
      className="text-ink-2 flex max-w-[44ch] flex-col items-center gap-3 font-serif text-xl [text-wrap:balance]"
      style={{ opacity }}
    >
      {children}
    </motion.p>
  );
}

function Launches({ config }: { config: PosterConfig }) {
  return (
    <Guided
      aria-labelledby="launches-heading"
      hatched={config.hatched.includes("launches")}
      id="cal"
      system={config.system}
    >
      <div className={`${column} py-32`}>
        <div className="mb-8 flex flex-col items-center gap-4 text-center">
          <p className="text-ink-3 text-sm">Cal.com · Head of Product</p>
          <h2
            className="text-4xl font-black tracking-[-0.04em] md:text-6xl"
            id="launches-heading"
          >
            November 2026
          </h2>
          <p className="text-ink-2 max-w-[40ch] font-serif text-xl">
            Five things I&apos;ve been working on.
          </p>
        </div>
        <ol className="divide-rule divide-y">
          {LAUNCHES.map((l) => (
            <Word from={config.fillFrom} key={l.name} {...l} />
          ))}
        </ol>
      </div>
    </Guided>
  );
}

function Setup({ config }: { config: PosterConfig }) {
  const track = useRef<HTMLElement>(null);
  const { progress, reduced } = usePinned(track);
  return (
    <section
      aria-labelledby="setup-heading"
      className={reduced ? "relative" : "relative h-[300vh]"}
      id="setup"
      ref={track}
    >
      <div className="sticky top-0 h-dvh min-h-[640px] overflow-hidden">
        <Guided
          className="h-full"
          hatched={config.hatched.includes("setup")}
          system={config.system}
        >
          <div className="flex h-dvh min-h-[640px] flex-col items-center justify-center gap-2 px-6">
            <p
              className="text-ink-3 flex items-center gap-2 text-sm"
              id="setup-heading"
            >
              <IconSnowFlakes aria-hidden className="size-4" />
              Winter setup
            </p>
            <Wheel items={SETUP} progress={progress} />
          </div>
        </Guided>
      </div>
    </section>
  );
}

function Life({ config }: { config: PosterConfig }) {
  const head = useRef<HTMLDivElement>(null);
  const fill = useCrossing(head, ["start 0.85", "start 0.35"]);
  return (
    <Guided
      aria-labelledby="life-heading"
      hatched={config.hatched.includes("life")}
      id="life"
      system={config.system}
    >
      <div className={`${column} py-32`}>
        <div
          className="mb-16 flex flex-col items-center gap-6 text-center"
          ref={head}
        >
          <OutlineFill
            as="h2"
            className={`${giant} text-[clamp(3rem,10.5vw,10.5rem)]`}
            fill={fill}
            from={config.fillFrom}
            id="life-heading"
          >
            Off the clock
          </OutlineFill>
          <p className="text-ink-2 max-w-[40ch] font-serif text-xl">
            Backcountry when there&apos;s snow. Enduro when there isn&apos;t.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <figure className="flex flex-col gap-3">
            <Photo
              alt="Matt carving a snowboard turn, one hand on the snow"
              src="/images/snowboard.png"
            />
            <figcaption className="text-ink-3 flex items-center gap-2 text-sm">
              <IconSnowFlakes aria-hidden className="size-4" />
              Bansko, Pirin
            </figcaption>
          </figure>
          <figure className="flex flex-col gap-3">
            <Photo
              alt="Matt on his mountain bike in a meadow below snow-capped Pirin"
              position="50% 70%"
              src="/images/mtb.png"
            />
            <figcaption className="text-ink-3 flex items-center gap-2 text-sm">
              <IconMountainBike aria-hidden className="size-4" />
              Below Pirin, spring
            </figcaption>
          </figure>
        </div>
        <SpecSheet />
      </div>
    </Guided>
  );
}

/** The bike, as a spec sheet: indexed rows on hairlines, values in mono. */
function SpecSheet() {
  return (
    <section
      aria-labelledby="vala-heading"
      className="surface grain mt-6 [--grain:0.06]"
    >
      <header className="border-rule flex flex-wrap items-baseline justify-between gap-3 border-b px-6 py-4">
        <h3
          className="text-ink flex items-center gap-2 font-medium"
          id="vala-heading"
        >
          <IconMountainBike aria-hidden className="text-sky size-4" />
          Santa Cruz Vala XX AXS RSV
        </h3>
        <span className="text-ink-3 font-mono text-xs">
          Current bike · 2027
        </span>
      </header>
      <dl className="grid grid-cols-1 sm:grid-cols-2">
        {VALA_SPECS.map(([k, v], i) => (
          <div
            className="border-rule flex items-baseline gap-4 border-b px-6 py-3 sm:odd:border-r [&:nth-last-child(-n+2)]:border-b-0"
            key={k}
          >
            <dt className="text-ink-3 flex w-32 shrink-0 items-baseline gap-4 text-sm">
              <span
                aria-hidden="true"
                className="text-sky w-6 font-mono text-[11px] tabular-nums"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              {k}
            </dt>
            <dd className="text-ink font-mono text-sm">{v}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
