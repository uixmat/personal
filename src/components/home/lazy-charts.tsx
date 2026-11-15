"use client";

import dynamic from "next/dynamic";
import { type ComponentType, useEffect, useRef, useState } from "react";

/**
 * Charts are below a 280vh hero, so none of them is needed for first paint.
 * Each one's code loads and runs only when its card comes within 600px of the
 * viewport — keeping the chart bundle and its render work off the main thread
 * at load. `minHeight` reserves the chart's space so nothing shifts.
 */
function InView({
  Chart,
  minHeight,
}: {
  Chart: ComponentType;
  minHeight: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: "600px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ minHeight }}>
      {near ? <Chart /> : null}
    </div>
  );
}

const placeholder = (minHeight: string) => () => <div style={{ minHeight }} />;

const charts = () => import("./bklit-charts");

const TemperatureChartLazy = dynamic(
  () => charts().then((m) => m.TemperatureChart),
  {
    ssr: false,
    loading: placeholder("15rem"),
  }
);
export const TemperatureChart = () => (
  <InView Chart={TemperatureChartLazy} minHeight="15rem" />
);

const SeasonRingLazy = dynamic(() => charts().then((m) => m.SeasonRing), {
  ssr: false,
  loading: placeholder("16.25rem"),
});
export const SeasonRing = () => (
  <InView Chart={SeasonRingLazy} minHeight="16.25rem" />
);

const SnowChartLazy = dynamic(() => charts().then((m) => m.SnowChart), {
  ssr: false,
  loading: placeholder("24rem"),
});
export const SnowChart = () => (
  <InView Chart={SnowChartLazy} minHeight="24rem" />
);

const StarsChartLazy = dynamic(() => charts().then((m) => m.StarsChart), {
  ssr: false,
  loading: placeholder("28rem"),
});
export const StarsChart = () => (
  <InView Chart={StarsChartLazy} minHeight="28rem" />
);

const ContributionsChartLazy = dynamic(
  () => charts().then((m) => m.ContributionsChart),
  {
    ssr: false,
    loading: placeholder("24rem"),
  }
);
export const ContributionsChart = () => (
  <InView Chart={ContributionsChartLazy} minHeight="24rem" />
);

const DownloadsChartLazy = dynamic(
  () => charts().then((m) => m.DownloadsChart),
  {
    ssr: false,
    loading: placeholder("28rem"),
  }
);
export const DownloadsChart = () => (
  <InView Chart={DownloadsChartLazy} minHeight="28rem" />
);
