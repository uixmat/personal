// Fetches every dataset the home page charts use into public/data/*.json.
// Run: bun scripts/build-data.mjs  (needs network + `gh` auth for GitHub)
import { execFileSync } from "node:child_process";
import { writeFile } from "node:fs/promises";

const OUT = new URL("../src/data/", import.meta.url);
const save = (name, data) =>
  writeFile(new URL(name, OUT), `${JSON.stringify(data)}\n`).then(() =>
    console.log(`wrote ${name}`)
  );
const gh = (args) =>
  JSON.parse(
    execFileSync("gh", ["api", ...args], {
      maxBuffer: 64 * 1024 * 1024,
    }).toString()
  );
const iso = (d) => d.toISOString().slice(0, 10);
const today = new Date();
const round1 = (v) => Math.round(v * 10) / 10;

// --- Bansko weather (Open-Meteo archive, no key) -----------------------------
const BANSKO = { lat: 41.84, lon: 23.49 };
const end = new Date(today.getTime() - 5 * 86_400_000); // archive lags ~5 days
const weatherUrl = `https://archive-api.open-meteo.com/v1/archive?latitude=${BANSKO.lat}&longitude=${BANSKO.lon}&start_date=1999-01-01&end_date=${iso(end)}&daily=temperature_2m_mean,temperature_2m_min,temperature_2m_max&timezone=Europe%2FSofia`;
const weather = (await (await fetch(weatherUrl)).json()).daily;

// Normals and records by day of year, plotted on leap year 2000 (366 days).
const buckets = Array.from({ length: 366 }, () => ({
  avg: [],
  min: [],
  max: [],
}));
const dayIndex = (dateStr) => {
  const [, m, d] = dateStr.split("-").map(Number);
  return Math.round(
    (Date.UTC(2000, m - 1, d) - Date.UTC(2000, 0, 1)) / 86_400_000
  );
};
weather.time.forEach((t, i) => {
  if (t > "2025-12-31") {
    return;
  }
  const b = buckets[dayIndex(t)];
  b.avg.push(weather.temperature_2m_mean[i]);
  b.min.push(weather.temperature_2m_min[i]);
  b.max.push(weather.temperature_2m_max[i]);
});
const mean = (a) => a.reduce((s, v) => s + v, 0) / a.length;
const thisYear = new Map();
weather.time.forEach((t, i) => {
  if (t.startsWith(String(today.getFullYear()))) {
    thisYear.set(dayIndex(t), weather.temperature_2m_mean[i]);
  }
});
await save("bansko-temperature.json", {
  source: "Open-Meteo archive · 41.84°N 23.49°E · 1999–2025",
  through: weather.time.at(-1),
  days: buckets.map((b, i) => ({
    date: Date.UTC(2000, 0, 1) + i * 86_400_000,
    avg: round1(mean(b.avg)),
    min: round1(mean(b.min)),
    max: round1(mean(b.max)),
    minmin: round1(Math.min(...b.min)),
    maxmax: round1(Math.max(...b.max)),
    temp: thisYear.has(i) ? round1(thisYear.get(i)) : null,
  })),
});

// Snow seasons run 1 Nov → 30 Apr, measured at the ski area (~2000 m), not the town.
const SKI = { lat: 41.795, lon: 23.43, elevation: 2000 };
const snowStart = `${today.getFullYear() - 3}-11-01`;
const snow = (
  await (
    await fetch(
      `https://archive-api.open-meteo.com/v1/archive?latitude=${SKI.lat}&longitude=${SKI.lon}&elevation=${SKI.elevation}&start_date=${snowStart}&end_date=${iso(end)}&daily=snowfall_sum&timezone=Europe%2FSofia`
    )
  ).json()
).daily;
const snowByDate = new Map(
  snow.time.map((t, i) => [t, snow.snowfall_sum[i] ?? 0])
);
const season = (startYear) => {
  const out = [];
  let total = 0;
  for (
    let d = Date.UTC(startYear, 10, 1);
    d <= Date.UTC(startYear + 1, 3, 30);
    d += 86_400_000
  ) {
    const key = iso(new Date(d));
    if (!snowByDate.has(key)) {
      break;
    }
    total += snowByDate.get(key);
    out.push({ day: out.length, date: key, total: round1(total) });
  }
  return out;
};
const lastSeasonStart =
  today.getMonth() >= 10 ? today.getFullYear() - 1 : today.getFullYear() - 2;
const recent = season(lastSeasonStart);
const prior = season(lastSeasonStart - 1);
const current = season(lastSeasonStart + 1);
await save("bansko-snow.json", {
  source: "Open-Meteo archive · Bansko ski area, 2000 m · snowfall, cm",
  seasons: {
    recent: {
      label: `${lastSeasonStart}–${String(lastSeasonStart + 1).slice(2)}`,
      days: recent,
    },
    prior: {
      label: `${lastSeasonStart - 1}–${String(lastSeasonStart).slice(2)}`,
      days: prior,
    },
  },
  current: {
    label: `${lastSeasonStart + 1}–${String(lastSeasonStart + 2).slice(2)}`,
    start: `${lastSeasonStart + 1}-11-01`,
    length: 181,
    elapsed: Math.max(
      0,
      Math.floor(
        (today.getTime() - Date.UTC(lastSeasonStart + 1, 10, 1)) / 86_400_000
      ) + 1
    ),
    snowDays: current.filter((d, i) => d.total > (current[i - 1]?.total ?? 0))
      .length,
    total: current.at(-1)?.total ?? 0,
  },
});

// --- Bklit UI stars (GitHub) ---------------------------------------------------
const starsRaw = [];
for (let page = 1; ; page += 1) {
  const batch = JSON.parse(
    execFileSync("gh", [
      "api",
      "-H",
      "Accept: application/vnd.github.star+json",
      `repos/bklit/bklit-ui/stargazers?per_page=100&page=${page}`,
    ]).toString()
  );
  starsRaw.push(...batch.map((s) => s.starred_at.slice(0, 10)));
  if (batch.length < 100) {
    break;
  }
}
const starsByDay = new Map();
for (const d of starsRaw) {
  starsByDay.set(d, (starsByDay.get(d) ?? 0) + 1);
}
const [firstStar] = [...starsRaw].sort();
const stars = [];
let count = 0;
for (let d = Date.parse(firstStar); d <= today.getTime(); d += 86_400_000) {
  count += starsByDay.get(iso(new Date(d))) ?? 0;
  stars.push({ date: d, stars: count });
}
// Goal ladder: 3K → 4K → 5K, then every 5K (DESIGN.md §9).
const nextGoal = (n) => {
  for (const g of [3000, 4000, 5000]) {
    if (n < g) {
      return g;
    }
  }
  return (Math.floor(n / 5000) + 1) * 5000;
};
await save("bklit-stars.json", {
  source: "GitHub · bklit/bklit-ui stargazers",
  goal: nextGoal(count),
  total: count,
  days: stars,
});

// --- GitHub contributions -------------------------------------------------------
const cal = gh([
  "graphql",
  "-f",
  'query={user(login:"uixmat"){contributionsCollection{contributionCalendar{totalContributions weeks{contributionDays{date contributionCount}}}}}}',
]).data.user.contributionsCollection.contributionCalendar;
await save("github-contributions.json", {
  source: "GitHub · uixmat contribution calendar",
  total: cal.totalContributions,
  days: cal.weeks
    .flatMap((w) => w.contributionDays)
    .map((d) => ({ date: Date.parse(d.date), count: d.contributionCount })),
});

// --- Onborda npm downloads ------------------------------------------------------
const yearAgo = new Date(today.getTime() - 364 * 86_400_000);
const npm = await (
  await fetch(
    `https://api.npmjs.org/downloads/range/${iso(yearAgo)}:${iso(today)}/onborda`
  )
).json();
const weeks = [];
for (let i = 0; i + 7 <= npm.downloads.length; i += 7) {
  const slice = npm.downloads.slice(i, i + 7);
  weeks.push({
    date: Date.parse(slice[0].day),
    downloads: slice.reduce((s, d) => s + d.downloads, 0),
  });
}
await save("onborda-downloads.json", {
  source: "npm · onborda weekly downloads",
  weeks,
});
