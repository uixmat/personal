// Builds static geo assets for the hero: Pirin heightmap + Europe outlines.
// Run: bun scripts/build-geo.mjs  (network required; outputs to public/geo)
import { writeFile } from "node:fs/promises";
import { geoOrthographic } from "d3-geo";
import { PNG } from "pngjs";
import { mesh } from "topojson-client";

const OUT = new URL("../public/geo/", import.meta.url);

// Centre of the world: Vihren, 2914 m.
export const CENTER = [23.3992, 41.7676];
const projection = geoOrthographic()
  .rotate([-CENTER[0], -CENTER[1]])
  .scale(6371) // km
  .translate([0, 0])
  .clipAngle(90);

// --- Pirin heightmap ---------------------------------------------------------
const BBOX = { west: 23.15, east: 23.75, south: 41.5, north: 41.98 };
const Z = 11;
const SIZE = 256;

const lon2x = (lon) => ((lon + 180) / 360) * 2 ** Z;
const lat2y = (lat) => {
  const r = (lat * Math.PI) / 180;
  return ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * 2 ** Z;
};

const x0 = Math.floor(lon2x(BBOX.west));
const x1 = Math.floor(lon2x(BBOX.east));
const y0 = Math.floor(lat2y(BBOX.north));
const y1 = Math.floor(lat2y(BBOX.south));
const coords = [];
for (let x = x0; x <= x1; x += 1) {
  for (let y = y0; y <= y1; y += 1) {
    coords.push([x, y]);
  }
}
const tiles = new Map(
  await Promise.all(
    coords.map(async ([x, y]) => {
      const url = `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${Z}/${x}/${y}.png`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`${res.status} ${url}`);
      }
      return [`${x}/${y}`, PNG.sync.read(Buffer.from(await res.arrayBuffer()))];
    })
  )
);
console.log(`fetched ${tiles.size} tiles`);

const sample = (fx, fy) => {
  // fx, fy in global tile-pixel space
  const tx = Math.floor(fx / 256);
  const ty = Math.floor(fy / 256);
  const png = tiles.get(`${tx}/${ty}`);
  const px = Math.min(255, Math.floor(fx - tx * 256));
  const py = Math.min(255, Math.floor(fy - ty * 256));
  const i = (py * 256 + px) * 4;
  return png.data[i] * 256 + png.data[i + 1] + png.data[i + 2] / 256 - 32_768;
};
// 2×2 supersample box filter, bilinear-ish
const heights = new Float32Array(SIZE * SIZE);
let hmin = Number.POSITIVE_INFINITY;
let hmax = Number.NEGATIVE_INFINITY;
for (let j = 0; j < SIZE; j += 1) {
  for (let i = 0; i < SIZE; i += 1) {
    let acc = 0;
    for (const [dx, dy] of [
      [0.25, 0.25],
      [0.75, 0.25],
      [0.25, 0.75],
      [0.75, 0.75],
    ]) {
      const lon = BBOX.west + ((i + dx) / SIZE) * (BBOX.east - BBOX.west);
      const lat = BBOX.north - ((j + dy) / SIZE) * (BBOX.north - BBOX.south);
      acc += sample(lon2x(lon) * 256, lat2y(lat) * 256);
    }
    const h = acc / 4;
    heights[j * SIZE + i] = h;
    hmin = Math.min(hmin, h);
    hmax = Math.max(hmax, h);
  }
}
const u16 = new Uint16Array(SIZE * SIZE);
for (let k = 0; k < u16.length; k += 1) {
  u16[k] = Math.round(((heights[k] - hmin) / (hmax - hmin)) * 65_535);
}
await writeFile(new URL("pirin.u16", OUT), Buffer.from(u16.buffer));

// Corners of the heightmap in projected km, so the mesh shares world space with the map.
const corner = (lon, lat) => {
  const [x, y] = projection([lon, lat]);
  return [x, -y];
};
await writeFile(
  new URL("pirin.json", OUT),
  JSON.stringify(
    {
      size: SIZE,
      bbox: BBOX,
      hmin: Math.round(hmin),
      hmax: Math.round(hmax),
      nw: corner(BBOX.west, BBOX.north),
      ne: corner(BBOX.east, BBOX.north),
      sw: corner(BBOX.west, BBOX.south),
      se: corner(BBOX.east, BBOX.south),
    },
    null,
    2
  )
);
console.log(`pirin heights ${Math.round(hmin)}–${Math.round(hmax)} m`);

// --- Europe outlines ---------------------------------------------------------
const topo = await (
  await fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json")
).json();
const inView = ([lon, lat]) => lon > -25 && lon < 50 && lat > 30 && lat < 72;

const segments = (geometry) => {
  const out = [];
  const lines =
    geometry.type === "MultiLineString"
      ? geometry.coordinates
      : [geometry.coordinates];
  for (const line of lines) {
    for (let k = 0; k < line.length - 1; k += 1) {
      const a = line[k];
      const b = line[k + 1];
      if (!(inView(a) || inView(b))) {
        continue;
      }
      const pa = projection(a);
      const pb = projection(b);
      if (!(pa && pb)) {
        continue;
      }
      out.push(pa[0], -pa[1], pb[0], -pb[1]);
    }
  }
  return new Float32Array(out);
};

const objects = topo.objects.countries;
const borders = segments(mesh(topo, objects, (a, b) => a !== b));
const coast = segments(mesh(topo, objects, (a, b) => a === b));
const bulgaria = segments(
  mesh(topo, {
    type: "GeometryCollection",
    geometries: objects.geometries.filter(
      (g) => g.properties.name === "Bulgaria"
    ),
  })
);
await writeFile(
  new URL("europe-borders.f32", OUT),
  Buffer.from(borders.buffer)
);
await writeFile(new URL("europe-coast.f32", OUT), Buffer.from(coast.buffer));
await writeFile(new URL("bulgaria.f32", OUT), Buffer.from(bulgaria.buffer));
console.log(
  `segments: borders ${borders.length / 4}, coast ${coast.length / 4}, bulgaria ${bulgaria.length / 4}`
);
