"use client";

import NumberFlow from "@number-flow/react";
import { TooltipHeader } from "@/components/charts/tooltip/tooltip-content";

/**
 * The one crosshair + date pill + tooltip combo for every time-series chart.
 * Spread onto <ChartTooltip> (not wrapped — Bklit reads chart children by type).
 */
export const TOOLTIP_STYLE = {
  showCrosshair: true,
  showDots: true,
  dotVariant: "ring",
  indicatorEnd: "plot",
  showDatePill: true,
  datePillAnimation: "roll",
  datePillVariant: "solid",
  className: "rounded-none before:rounded-none [&>div]:rounded-none",
  datePillClassName:
    "rounded-none bg-ink px-3 py-1 font-mono text-night text-xs shadow-none",
} as const;

export interface FlowRow {
  color: string;
  decimals?: number;
  key: string;
  label: string;
  suffix?: string;
}

const dayFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

/**
 * One tooltip for every chart: the date as a header, each series value rolled
 * with NumberFlow in the same mono style as the card readouts.
 */
export function flowTooltip(rows: FlowRow[]) {
  return ({ point }: { point: Record<string, unknown> }) => (
    <FlowTooltip point={point} rows={rows} />
  );
}

function FlowTooltip({
  point,
  rows,
}: {
  point: Record<string, unknown>;
  rows: FlowRow[];
}) {
  const date = point.date instanceof Date ? point.date : null;
  return (
    <div>
      {date ? <TooltipHeader>{dayFormat.format(date)}</TooltipHeader> : null}
      <div className="space-y-2 px-3.5 py-3">
        {rows.map((row) => {
          const value = point[row.key];
          if (typeof value !== "number") {
            return null;
          }
          return (
            <div
              className="flex items-center justify-between gap-6"
              key={row.key}
            >
              <span className="text-chart-tooltip-muted flex items-center gap-2 text-sm">
                <span
                  className="size-2 shrink-0"
                  style={{ backgroundColor: row.color }}
                />
                {row.label}
              </span>
              <NumberFlow
                className="text-chart-tooltip-foreground font-mono text-sm tabular-nums"
                format={{ maximumFractionDigits: row.decimals ?? 0 }}
                suffix={row.suffix}
                value={value}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
