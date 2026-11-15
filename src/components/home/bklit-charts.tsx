"use client";

import { curveLinear, curveMonotoneX } from "d3-shape";
import { type ComponentProps, useEffect, useMemo, useState } from "react";
import { Area } from "@/components/charts/area";
import { AreaChart } from "@/components/charts/area-chart";
import { Background } from "@/components/charts/background";
import { Band } from "@/components/charts/band";
import { useChartHover } from "@/components/charts/chart-context";
import { ChartStatFlow } from "@/components/charts/chart-stat-flow";
import { ComposedChart } from "@/components/charts/composed-chart";
import { Line } from "@/components/charts/line";
import { LineChart } from "@/components/charts/line-chart";
import { LineSeriesTerminalMarker } from "@/components/charts/line-series-terminal-marker";
import { PieCenter } from "@/components/charts/pie-center";
import { PieChart } from "@/components/charts/pie-chart";
import { PieTicks } from "@/components/charts/pie-ticks";
import { ProjectionLine } from "@/components/charts/projection-line";
import { buildProjectionPath } from "@/components/charts/projection-utils";
import { RadialArea } from "@/components/charts/radial-area";
import { RadialAxis } from "@/components/charts/radial-axis";
import {
  RadialChart,
  type RadialSeries,
} from "@/components/charts/radial-chart";
import { RadialLine } from "@/components/charts/radial-line";
import { RadialScrubber } from "@/components/charts/radial-scrubber";
import { Scatter } from "@/components/charts/scatter";
import { ChartTooltip } from "@/components/charts/tooltip";
import { XAxis } from "@/components/charts/x-axis";
import snow from "@/data/bansko-snow.json";
import temperature from "@/data/bansko-temperature.json";
import stars from "@/data/bklit-stars.json";
import contributions from "@/data/github-contributions.json";
import onborda from "@/data/onborda-downloads.json";
import { flowTooltip, TOOLTIP_STYLE } from "./flow-tooltip";

const number = new Intl.NumberFormat("en-GB");
const dayFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

/* Seasonal temperature card — Bansko ------------------------------------------ */

const temperatureSeries: RadialSeries[] = [
  { dataKey: "avg", label: "Daily average", color: "var(--chart-1)" },
];
const annual = {
  avg:
    temperature.days.reduce((s, d) => s + d.avg, 0) / temperature.days.length,
  min: Math.min(...temperature.days.map((d) => d.min)),
  max: Math.max(...temperature.days.map((d) => d.max)),
  minmin: Math.min(...temperature.days.map((d) => d.minmin)),
  maxmax: Math.max(...temperature.days.map((d) => d.maxmax)),
};

function Range({
  label,
  low,
  high,
  opacity,
}: {
  label: string;
  low: number;
  high: number;
  opacity: number;
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span
        aria-hidden="true"
        className="h-2 w-3 shrink-0 rounded-sm"
        style={{ background: "var(--chart-1)", opacity }}
      />
      <span className="text-ink-3 flex-1">{label}</span>
      <span className="text-ink font-mono tabular-nums">
        {Math.round(low)} to {Math.round(high)}°C
      </span>
    </div>
  );
}

export function TemperatureChart() {
  const [hovered, setHovered] = useState<number | null>(null);
  const day = hovered === null ? null : temperature.days[hovered];
  const stats = day ?? annual;

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row">
      <div className="w-full max-w-[240px] shrink-0">
        <RadialChart
          angleType="time"
          data={temperature.days}
          hoveredIndex={hovered}
          maxValue="auto"
          minValue="auto"
          niceValues={false}
          onHoverChange={setHovered}
          series={temperatureSeries}
          valueKeys={["minmin", "maxmax"]}
          xDataKey="date"
        >
          <RadialAxis showCircle={false} showValueLabels={false} />
          <RadialArea
            baseDataKey="minmin"
            color="var(--chart-1)"
            curve="linear"
            dataKey="maxmax"
            fillOpacity={0.14}
            rampFrom={1}
            stroke="none"
          />
          <RadialArea
            baseDataKey="min"
            color="var(--chart-1)"
            curve="linear"
            dataKey="max"
            fillOpacity={0.32}
            rampFrom={1}
            stroke="none"
          />
          <RadialLine dataKey="avg" strokeWidth={1.5} />
          <RadialScrubber variant="gradient" />
        </RadialChart>
      </div>
      <div className="flex w-full min-w-0 flex-1 flex-col gap-3">
        <div>
          <div className="text-ink font-mono text-3xl font-medium tracking-tight tabular-nums">
            {stats.avg.toFixed(1)}°C
          </div>
          <div className="text-ink-3 text-sm">
            {day
              ? `Average on ${dayFormat.format(day.date)}`
              : "Annual average"}
          </div>
        </div>
        <div className="border-rule flex flex-col gap-1.5 border-t pt-3">
          <Range
            high={stats.max}
            label="Normal"
            low={stats.min}
            opacity={0.5}
          />
          <Range
            high={stats.maxmax}
            label="Record"
            low={stats.minmin}
            opacity={0.22}
          />
        </div>
      </div>
    </div>
  );
}

/** Reports the hovered row up to the card, so its NumberFlow readout can follow. */
function HoverReport({
  onChange,
}: {
  onChange: (point: Record<string, unknown> | null) => void;
}) {
  const point = useChartHover().tooltipData?.point ?? null;
  useEffect(() => onChange(point), [point, onChange]);
  return null;
}

/**
 * ChartStatFlow decides NumberFlow readiness from `customElements` during its
 * first render, which differs between server and client and breaks hydration.
 * Render the plain number until mounted, then hand over to NumberFlow.
 */
function StatFlow(props: ComponentProps<typeof ChartStatFlow>) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) {
    return (
      <div className="flex flex-col">
        <span className={props.valueClassName}>
          {number.format(props.value)}
          {props.suffix}
        </span>
        <span className={props.labelClassName}>{props.label}</span>
      </div>
    );
  }
  // ChartStatFlow renders a fragment; keep value + label together as one block.
  return (
    <div className="flex flex-col">
      <ChartStatFlow {...props} />
    </div>
  );
}

const SNOW_TIP = flowTooltip([
  {
    key: "thisYear",
    label: snow.seasons.recent.label,
    color: "var(--chart-1)",
    suffix: " cm",
  },
  {
    key: "lastYear",
    label: snow.seasons.prior.label,
    color: "var(--chart-3)",
    suffix: " cm",
  },
]);
const STARS_TIP = flowTooltip([
  { key: "stars", label: "Stars", color: "var(--chart-1)" },
]);
const COMMITS_TIP = flowTooltip([
  { key: "contributions", label: "Contributions", color: "var(--chart-2)" },
  {
    key: "average",
    label: "4-week average",
    color: "var(--chart-1)",
    decimals: 1,
  },
]);
const DOWNLOADS_TIP = flowTooltip([
  { key: "actual", label: "Downloads", color: "var(--chart-1)" },
  { key: "projected", label: "Trend", color: "var(--chart-3)" },
]);

const statValue =
  "font-mono text-3xl text-ink leading-none tabular-nums tracking-tight";
const statLabel = "text-ink-3 text-sm";

/* Year over year — snowfall, last two winters ---------------------------------- */

export function SnowChart() {
  const [hover, setHover] = useState<Record<string, unknown> | null>(null);
  const data = useMemo(
    () =>
      // ≤ 60 points keeps Bklit's interaction animated (crosshair spring + pill roll).
      snow.seasons.recent.days
        .map((d, i) => ({ d, i }))
        .filter(({ i }, _, all) => i % 4 === 0 || i === all.length - 1)
        .map(({ d, i }) => ({
          date: new Date(`${d.date}T00:00:00Z`),
          thisYear: d.total,
          lastYear: snow.seasons.prior.days[i]?.total ?? null,
        })),
    []
  );
  const value =
    (hover?.thisYear as number | undefined) ?? data.at(-1)?.thisYear ?? 0;
  const label = hover ? dayFormat.format(hover.date as Date) : "Season total";

  return (
    <div className="flex flex-col gap-4">
      <StatFlow
        label={label}
        labelClassName={statLabel}
        suffix=" cm"
        value={Math.round(value)}
        valueClassName={statValue}
      />
      <LineChart aspectRatio="16 / 9" data={data}>
        <HoverReport onChange={setHover} />
        <Background
          fadeHorizontalLength={20}
          fadeVerticalLength={33}
          opacity={0.85}
          pattern="dots"
        />
        <Band
          curve={curveLinear}
          fill="var(--chart-1)"
          fillType="pattern"
          label="Difference"
          lowerKey="lastYear"
          pattern="diagonal-up"
          patternOpacity={0.5}
          strokeWidth={0}
          upperKey="thisYear"
        />
        <Line
          curve={curveLinear}
          dashArray="0,5"
          dashFromIndex={0}
          dataKey="lastYear"
          stroke="var(--chart-3)"
          strokeWidth={2}
        />
        <Line
          curve={curveLinear}
          dataKey="thisYear"
          stroke="var(--chart-1)"
          strokeWidth={1.5}
        />
        <XAxis />
        <ChartTooltip {...TOOLTIP_STYLE} content={SNOW_TIP} />
      </LineChart>
    </div>
  );
}

/* Tick ring — how far into this season ---------------------------------------- */

export function SeasonRing() {
  const { elapsed, length, snowDays } = snow.current;
  const slices = [
    { label: "Snow days", value: snowDays, color: "var(--color-sky)" },
    {
      label: "Dry days",
      value: Math.max(0, elapsed - snowDays),
      color: "color-mix(in oklch, var(--color-ink) 60%, transparent)",
    },
    {
      label: "Still to come",
      value: Math.max(0, length - elapsed),
      color: "color-mix(in oklch, var(--color-ink) 18%, transparent)",
    },
  ];
  return (
    <div className="mx-auto aspect-square w-full max-w-[260px]">
      <PieChart data={slices} innerRadius={72}>
        <PieTicks hoverEffect="tick" />
        <PieCenter defaultLabel={`Day ${elapsed} of ${length}`}>
          {({ value, label, isHovered }) => (
            <div className="flex flex-col items-center gap-1">
              <span className="text-ink font-mono text-3xl tabular-nums">
                {isHovered ? value : `${Math.round((elapsed / length) * 100)}%`}
              </span>
              <span className="text-ink-3 text-xs">
                {isHovered ? label : `Day ${elapsed} of ${length}`}
              </span>
            </div>
          )}
        </PieCenter>
      </PieChart>
    </div>
  );
}

const formatStars = (v: number) => number.format(Math.round(v));

/* Projected goal — Bklit UI stars ---------------------------------------------- */

/** A row of small stats under a chart — keeps paired cards the same height. */
function Stats({ items }: { items: [string, string][] }) {
  return (
    <dl className="border-rule grid grid-cols-2 gap-x-6 border-t pt-4 sm:grid-cols-4">
      {items.map(([label, value]) => (
        <div className="flex flex-col gap-1 py-1" key={label}>
          <dt className="text-ink-3 text-xs">{label}</dt>
          <dd className="text-ink font-mono text-sm tabular-nums">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** "20 Sep" — en-GB writes "Sept", which wraps in the stat strips. */
const shortDay = (ms: number) => {
  const d = new Date(ms);
  return `${d.getUTCDate()} ${d.toLocaleString("en-US", { month: "short", timeZone: "UTC" })}`;
};

const starStats = (() => {
  const { days } = stars;
  const gains = days.map((d, i) => d.stars - (days[i - 1]?.stars ?? 0));
  const best = gains.indexOf(Math.max(...gains));
  const monthAgo = days.at(-31)?.stars ?? 0;
  return [
    ["Last 30 days", `+${number.format(stars.total - monthAgo)}`],
    [`Best day · ${shortDay(days[best].date)}`, `+${gains[best]}`],
    ["To goal", number.format(stars.goal - stars.total)],
    ["Since", dayFormat.format(new Date(days[0].date))],
  ] as [string, string][];
})();

const downloadStats = (() => {
  const { weeks } = onborda;
  const total = weeks.reduce((sum, w) => sum + w.downloads, 0);
  const peak = weeks.reduce((a, b) => (b.downloads > a.downloads ? b : a));
  const avg = (list: typeof weeks) =>
    list.reduce((sum, w) => sum + w.downloads, 0) / list.length;
  const change = (avg(weeks.slice(-8)) / avg(weeks.slice(0, 8)) - 1) * 100;
  const compact = new Intl.NumberFormat("en-GB", {
    notation: "compact",
    maximumFractionDigits: 1,
  });
  return [
    ["Last 12 months", compact.format(total)],
    ["Last week", number.format(weeks.at(-1)?.downloads ?? 0)],
    [`Peak · ${shortDay(peak.date)}`, compact.format(peak.downloads)],
    ["Trend", `${change >= 0 ? "+" : ""}${Math.round(change)}%`],
  ] as [string, string][];
})();

export function StarsChart() {
  const [hover, setHover] = useState<Record<string, unknown> | null>(null);
  const { data, projection } = useMemo(() => {
    // Weekly points keep the line readable.
    const weekly = stars.days
      .filter((_, i, all) => i % 7 === 0 || i === all.length - 1)
      .map((d) => ({ date: new Date(d.date), stars: d.stars }));
    const recent = weekly.slice(-9);
    const perWeek =
      ((recent.at(-1)?.stars ?? 0) - recent[0].stars) / (recent.length - 1);
    const weeksToGoal = Math.ceil(
      (stars.goal - stars.total) / Math.max(1, perWeek)
    );
    return {
      data: weekly,
      projection: buildProjectionPath({
        sourceData: weekly,
        seriesKey: "stars",
        mode: "auto",
        autoMethod: "linearRegression",
        pathDensity: "endpoints",
        horizonPoints: Math.min(
          52,
          Math.max(4, Math.round(weeksToGoal * 1.15))
        ),
      }),
    };
  }, []);

  const value = (hover?.stars as number | undefined) ?? stars.total;
  const label = hover
    ? dayFormat.format(hover.date as Date)
    : "Stars on GitHub";
  return (
    <div className="flex flex-col gap-4">
      <StatFlow
        label={label}
        labelClassName={statLabel}
        value={value}
        valueClassName={statValue}
      />
      <AreaChart aspectRatio="16 / 9" data={data}>
        <HoverReport onChange={setHover} />
        <Background
          fadeHorizontalLength={20}
          fadeVerticalLength={33}
          opacity={0.85}
          pattern="dots"
        />
        <Area
          dataKey="stars"
          fadeBottom={100}
          fill="var(--chart-2)"
          fillOpacity={0.14}
          strokeWidth={2}
        />
        <LineSeriesTerminalMarker
          dataKey="stars"
          fill="var(--color-night)"
          radius={4}
          stroke="var(--chart-2)"
        />
        <ProjectionLine
          areaFadeBottom={100}
          areaFill="pattern"
          areaOpacity={0.35}
          areaPatternTint={0.12}
          data={projection}
          endMarkerFill="var(--color-night)"
          endpointRadius={5}
          formatEndLabel={formatStars}
          showEndLabel
          showGuides
          stroke="var(--chart-1)"
          strokeDasharray="none"
          target={stars.goal}
        />
        <XAxis />
        <ChartTooltip {...TOOLTIP_STYLE} content={STARS_TIP} />
      </AreaChart>
      <Stats items={starStats} />
    </div>
  );
}

/* Signal & noise — GitHub contributions ---------------------------------------- */

export function ContributionsChart() {
  const [hover, setHover] = useState<Record<string, unknown> | null>(null);
  const data = useMemo(() => {
    // Weekly totals (≤ 60 points keeps Bklit's interaction animated),
    // with a 4-week rolling average as the signal.
    const { days } = contributions;
    const weeks: { date: Date; contributions: number }[] = [];
    for (let k = 0; k < days.length; k += 7) {
      const slice = days.slice(k, k + 7);
      weeks.push({
        date: new Date(slice[0].date),
        contributions: slice.reduce((sum, d) => sum + d.count, 0),
      });
    }
    return weeks.map((w, k) => {
      const window = weeks.slice(Math.max(0, k - 3), k + 1);
      return {
        ...w,
        average:
          Math.round(
            (window.reduce((sum, x) => sum + x.contributions, 0) /
              window.length) *
              10
          ) / 10,
      };
    });
  }, []);
  const value =
    (hover?.contributions as number | undefined) ?? contributions.total;
  const label = hover
    ? `Week of ${dayFormat.format(hover.date as Date)}`
    : "Contributions this year";

  return (
    <div className="flex flex-col gap-4">
      <StatFlow
        label={label}
        labelClassName={statLabel}
        value={value}
        valueClassName={statValue}
      />
      <ComposedChart aspectRatio="16 / 9" data={data}>
        <HoverReport onChange={setHover} />
        <Background
          fadeHorizontalLength={20}
          fadeVerticalLength={33}
          opacity={0.85}
          pattern="dots"
        />
        <Scatter
          dataKey="contributions"
          fill="color-mix(in oklch, var(--chart-2) 55%, transparent)"
          radius={3.5}
        />
        <Line
          curve={curveMonotoneX}
          dataKey="average"
          stroke="var(--chart-1)"
          strokeWidth={2.5}
        />
        <XAxis />
        <ChartTooltip {...TOOLTIP_STYLE} content={COMMITS_TIP} />
      </ComposedChart>
    </div>
  );
}

/* Gap fill — Onborda weekly downloads vs trend ---------------------------------- */

export function DownloadsChart() {
  const [hover, setHover] = useState<Record<string, unknown> | null>(null);
  const data = useMemo(() => {
    const { weeks } = onborda;
    const n = weeks.length;
    const xs = weeks.map((_, i) => i);
    const ys = weeks.map((w) => w.downloads);
    const mx = (n - 1) / 2;
    const my = ys.reduce((s, v) => s + v, 0) / n;
    const slope =
      xs.reduce((s, x, i) => s + (x - mx) * (ys[i] - my), 0) /
      xs.reduce((s, x) => s + (x - mx) ** 2, 0);
    return weeks.map((w, i) => ({
      date: new Date(w.date),
      actual: w.downloads,
      projected: Math.round(my + slope * (i - mx)),
    }));
  }, []);
  const value =
    (hover?.actual as number | undefined) ?? data.at(-1)?.actual ?? 0;
  const label = hover
    ? `Week of ${dayFormat.format(hover.date as Date)}`
    : "Downloads last week";
  return (
    <div className="flex flex-col gap-4">
      <StatFlow
        label={label}
        labelClassName={statLabel}
        value={value}
        valueClassName={statValue}
      />
      <LineChart aspectRatio="16 / 9" data={data}>
        <HoverReport onChange={setHover} />
        <Background
          fadeHorizontalLength={20}
          fadeVerticalLength={33}
          opacity={0.85}
          pattern="dots"
        />
        <Band
          fill="var(--chart-1)"
          fillOpacity={0.25}
          label="Gap"
          lowerKey="projected"
          negativeFill="var(--chart-negative)"
          strokeWidth={0}
          upperKey="actual"
        />
        <Line
          dashArray="4,4"
          dashFromIndex={0}
          dataKey="projected"
          stroke="var(--chart-1)"
          strokeWidth={1.5}
        />
        <Line dataKey="actual" stroke="var(--chart-1)" strokeWidth={2} />
        <XAxis />
        <ChartTooltip {...TOOLTIP_STYLE} content={DOWNLOADS_TIP} />
      </LineChart>
      <Stats items={downloadStats} />
    </div>
  );
}
