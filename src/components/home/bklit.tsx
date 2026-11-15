import { IconVercel } from "central-icons";
import type { ReactNode } from "react";
import {
  ContributionsChart,
  DownloadsChart,
  SeasonRing,
  SnowChart,
  StarsChart,
  TemperatureChart,
} from "./bklit-charts";
import { meta } from "./bklit-meta";

const n = new Intl.NumberFormat("en-GB");
const compact = new Intl.NumberFormat("en-GB", {
  notation: "compact",
  maximumFractionDigits: 2,
});

function Card({
  title,
  caption,
  source,
  className = "",
  children,
}: {
  title: string;
  caption: ReactNode;
  source: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <article
      className={`surface grain relative flex flex-col gap-5 overflow-hidden p-6 [--grain:0.07] md:p-7 ${className}`}
    >
      <header className="relative z-10 flex flex-col gap-1">
        <h3 className="text-ink text-lg font-medium tracking-tight">{title}</h3>
        <p className="text-ink-2 font-serif [text-wrap:pretty]">{caption}</p>
      </header>
      <div className="relative z-10 flex-1">{children}</div>
      <footer className="text-ink-3 relative z-10 font-mono text-xs">
        {source}
      </footer>
    </article>
  );
}

export function Bklit() {
  const { snow, stars, contributions, onborda, temperature } = meta;
  return (
    <section aria-labelledby="bklit-heading" className="relative" id="bklit">
      <div className="mx-auto grid max-w-7xl grid-cols-12 gap-x-8 gap-y-10 px-6 py-32 md:px-10">
        <div className="col-span-12 flex flex-col gap-5 lg:col-span-5">
          <p className="text-ink-3 text-sm">Bklit UI · Author</p>
          <h2
            className="text-4xl font-medium tracking-[-0.03em] md:text-5xl"
            id="bklit-heading"
          >
            Charts you can feel.
          </h2>
        </div>
        <div className="col-span-12 flex flex-col gap-4 lg:col-span-6 lg:col-start-7 lg:pt-10">
          <p className="text-ink-2 max-w-[48ch] font-serif text-lg [text-wrap:pretty]">
            An open-source chart and data-viz library for React, built on d3,
            Motion and Tailwind. Every chart below is a Bklit component drawn
            from real data: my mountains, my code, my projects.
          </p>
          <a
            className="text-ink decoration-ink-3/50 hover:decoration-ink w-fit underline underline-offset-4 transition-colors duration-150"
            href="https://bklit.com"
          >
            bklit.com ↗
          </a>
          <p className="border-rule text-ink-2 flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-sm">
            <IconVercel aria-hidden="true" className="text-ink size-3.5" />
            Member of the Vercel OSS Program
          </p>
        </div>

        <div className="col-span-12 grid grid-cols-12 gap-4 md:gap-5">
          <Card
            caption="Daily average over the normal and record range, 1999–2025."
            className="col-span-12 lg:col-span-7"
            source={temperature.source}
            title="Bansko through the year"
          >
            <TemperatureChart />
          </Card>
          <Card
            caption={`${snow.current.snowDays} snow days so far, ${Math.round(snow.current.total)} cm on the slopes.`}
            className="col-span-12 md:col-span-6 lg:col-span-5"
            source={`Open-Meteo · season ${snow.current.label}, 1 Nov to 30 Apr`}
            title={`Winter ${snow.current.label}`}
          >
            <SeasonRing />
          </Card>
          <Card
            caption={`${snow.recent.label} against ${snow.prior.label} (dotted): ${Math.round(snow.recent.days.at(-1)?.total ?? 0)} cm against ${Math.round(snow.prior.days.at(-1)?.total ?? 0)} cm.`}
            className="col-span-12 md:col-span-6"
            source={snow.source}
            title="Snowfall, last two winters"
          >
            <SnowChart />
          </Card>
          <Card
            caption={`${n.format(stars.total)} stars, projected to the next goal of ${n.format(stars.goal)}.`}
            className="col-span-12 md:col-span-6"
            source={stars.source}
            title="Bklit UI on GitHub"
          >
            <StarsChart />
          </Card>
          <Card
            caption={`${n.format(contributions.total)} contributions this year. Dots are weeks, the line a 4-week average.`}
            className="col-span-12 lg:col-span-7"
            source={contributions.source}
            title="A year of commits"
          >
            <ContributionsChart />
          </Card>
          <Card
            caption={`Weekly npm downloads against their trend: ${compact.format(onborda.total)} in the last year.`}
            className="col-span-12 lg:col-span-5"
            source={onborda.source}
            title="Onborda"
          >
            <DownloadsChart />
          </Card>
        </div>
      </div>
    </section>
  );
}
