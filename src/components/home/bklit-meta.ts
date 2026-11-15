import snow from "@/data/bansko-snow.json";
import temperature from "@/data/bansko-temperature.json";
import stars from "@/data/bklit-stars.json";
import contributions from "@/data/github-contributions.json";
import onborda from "@/data/onborda-downloads.json";

/** Captions and sources for the Bklit cards — server-safe (no client code). */
export const meta = {
  temperature: { source: temperature.source },
  snow: {
    source: snow.source,
    recent: snow.seasons.recent,
    prior: snow.seasons.prior,
    current: snow.current,
  },
  stars: { source: stars.source, total: stars.total, goal: stars.goal },
  contributions: { source: contributions.source, total: contributions.total },
  onborda: {
    source: onborda.source,
    total: onborda.weeks.reduce((s, w) => s + w.downloads, 0),
  },
};
