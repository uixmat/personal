"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { contours } from "d3-contour";
import { geoGraticule, geoOrthographic } from "d3-geo";
import { type MotionValue, useMotionValueEvent } from "motion/react";
import { type RefObject, useEffect, useMemo, useState } from "react";
import {
  BufferGeometry,
  Color,
  DoubleSide,
  Float32BufferAttribute,
  LineBasicMaterial,
  type Mesh,
  MeshBasicMaterial,
  Object3D,
  type OrthographicCamera,
  type LineSegments as Seg,
  Vector3,
} from "three";
import type { Palette } from "./palette";

const VIHREN = { lon: 23.3992, lat: 41.7676, h: 2914 };
const ROWS = 60;

const projection = geoOrthographic()
  .rotate([-VIHREN.lon, -VIHREN.lat])
  .scale(6371)
  .translate([0, 0])
  .clipAngle(90);

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const ramp = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));

interface PirinMeta {
  hmax: number;
  hmin: number;
  ne: [number, number];
  nw: [number, number];
  se: [number, number];
  size: number;
  sw: [number, number];
}

interface GeoData {
  borders: Float32Array;
  bulgaria: Float32Array;
  coast: Float32Array;
  heights: Uint16Array;
  meta: PirinMeta;
}

let cache: Promise<GeoData> | null = null;
function loadGeo() {
  cache ??= (async () => {
    const bin = async (path: string) => (await fetch(path)).arrayBuffer();
    const [coast, borders, bulgaria, heights, meta] = await Promise.all([
      bin("/geo/europe-coast.f32"),
      bin("/geo/europe-borders.f32"),
      bin("/geo/bulgaria.f32"),
      bin("/geo/pirin.u16"),
      fetch("/geo/pirin.json").then((r) => r.json() as Promise<PirinMeta>),
    ]);
    return {
      coast: new Float32Array(coast),
      borders: new Float32Array(borders),
      bulgaria: new Float32Array(bulgaria),
      heights: new Uint16Array(heights),
      meta,
    };
  })();
  return cache;
}

/** 2D map segments [x1,y1,x2,y2] (km, y north) → XZ plane. */
function planar(segs: Float32Array | number[], y = 0) {
  const out = new Float32Array((segs.length / 4) * 6);
  for (let k = 0, o = 0; k < segs.length; k += 4, o += 6) {
    out[o] = segs[k];
    out[o + 1] = y;
    out[o + 2] = -segs[k + 1];
    out[o + 3] = segs[k + 2];
    out[o + 4] = y;
    out[o + 5] = -segs[k + 3];
  }
  return geometry(out);
}

function geometry(positions: Float32Array | number[]) {
  const g = new BufferGeometry();
  g.setAttribute("position", new Float32BufferAttribute(positions, 3));
  return g;
}

function graticule(step: number, extent: [[number, number], [number, number]]) {
  const segs: number[] = [];
  const g = geoGraticule().step([step, step]).extent(extent).precision(1);
  for (const line of g.lines()) {
    const pts = line.coordinates.map((c) => projection(c as [number, number]));
    for (let k = 0; k < pts.length - 1; k += 1) {
      const a = pts[k];
      const b = pts[k + 1];
      if (a && b) {
        segs.push(a[0], -a[1], b[0], -b[1]);
      }
    }
  }
  return planar(segs);
}

function buildTerrain(data: GeoData) {
  const { size, hmin, hmax, nw, ne, sw, se } = data.meta;
  const hKm = (i: number, j: number) =>
    (hmin + (data.heights[j * size + i] / 65_535) * (hmax - hmin)) / 1000;
  // Bilinear position from the four projected corners (km, y north).
  const at = (ux: number, vy: number): [number, number] => {
    const tx = lerp(nw[0], ne[0], ux);
    const ty = lerp(nw[1], ne[1], ux);
    const bx = lerp(sw[0], se[0], ux);
    const by = lerp(sw[1], se[1], ux);
    return [lerp(tx, bx, vy), lerp(ty, by, vy)];
  };

  // Ridgelines: east–west profiles with an occluding curtain beneath each.
  const lines: number[] = [];
  const curtain: number[] = [];
  for (let r = 0; r < ROWS; r += 1) {
    const j = Math.round((r / (ROWS - 1)) * (size - 1));
    for (let i = 0; i < size - 1; i += 1) {
      const [x1, y1] = at(i / (size - 1), j / (size - 1));
      const [x2, y2] = at((i + 1) / (size - 1), j / (size - 1));
      const h1 = hKm(i, j);
      const h2 = hKm(i + 1, j);
      lines.push(x1, h1, -y1, x2, h2, -y2);
      curtain.push(x1, h1, -y1, x1, 0, -y1, x2, h2, -y2);
      curtain.push(x2, h2, -y2, x1, 0, -y1, x2, 0, -y2);
    }
  }

  // 100 m contours, 500 m index contours, flat on the ground plane.
  const values = new Float64Array(size * size);
  for (let k = 0; k < values.length; k += 1) {
    values[k] = hmin + (data.heights[k] / 65_535) * (hmax - hmin);
  }
  const thresholds = Array.from({ length: 29 }, (_, k) => (k + 1) * 100);
  const minor: number[] = [];
  const index: number[] = [];
  for (const c of contours().size([size, size]).thresholds(thresholds)(
    Array.from(values)
  )) {
    const target = c.value % 500 === 0 ? index : minor;
    for (const poly of c.coordinates) {
      for (const ring of poly) {
        for (let k = 0; k < ring.length - 1; k += 1) {
          const a = at(ring[k][0] / size, ring[k][1] / size);
          const b = at(ring[k + 1][0] / size, ring[k + 1][1] / size);
          target.push(a[0], a[1], b[0], b[1]);
        }
      }
    }
  }

  const box = [nw, ne, ne, se, se, sw, sw, nw].flat();
  const center = at(0.5, 0.5);
  const vihren = projection([VIHREN.lon, VIHREN.lat]) as [number, number];
  // Height under Vihren from the mesh, so the trig mark sits on the surface.
  const u = (vihren[0] - nw[0]) / (ne[0] - nw[0]);
  const v = (-vihren[1] - nw[1]) / (sw[1] - nw[1]);
  const vihrenH = hKm(
    Math.round(clamp01(u) * (size - 1)),
    Math.round(clamp01(v) * (size - 1))
  );

  return {
    lines: geometry(lines),
    curtain: geometry(curtain),
    minor: planar(minor, 0.002),
    index: planar(index, 0.002),
    box: planar(box, 0.003),
    center,
    vihren: [vihren[0], -vihren[1]] as [number, number],
    vihrenH,
    width: Math.hypot(ne[0] - nw[0], ne[1] - nw[1]),
  };
}

export interface PirinOverlay {
  scale: RefObject<HTMLDivElement | null>;
  scaleLabel: RefObject<HTMLSpanElement | null>;
  trig: RefObject<HTMLDivElement | null>;
}

function Scene({
  data,
  progress,
  exaggeration,
  palette,
  overlay,
}: {
  data: GeoData;
  progress: MotionValue<number>;
  exaggeration: MotionValue<number>;
  palette: Palette;
  overlay: PirinOverlay;
}) {
  const { camera, size, invalidate } = useThree();

  const geo = useMemo(
    () => ({
      coast: planar(data.coast),
      borders: planar(data.borders),
      bulgaria: planar(data.bulgaria, 0.001),
      g10: graticule(10, [
        [-30, 20],
        [60, 80],
      ]),
      g1: graticule(1, [
        [12, 34],
        [35, 50],
      ]),
      terrain: buildTerrain(data),
    }),
    [data]
  );

  const mat = useMemo(() => {
    const line = (color: string) =>
      new LineBasicMaterial({
        color: new Color(color),
        transparent: true,
        depthWrite: false,
      });
    return {
      coast: line(palette.ink3),
      borders: line(palette.ink3),
      bulgaria: line(palette.accent),
      g10: line(palette.ruleStrong),
      g1: line(palette.ruleStrong),
      box: line(palette.accent),
      minor: line(palette.ink3),
      index: line(palette.ink2),
      ridge: line(palette.ink),
      curtain: new MeshBasicMaterial({
        color: new Color(palette.paper),
        side: DoubleSide,
        polygonOffset: true,
        polygonOffsetFactor: 1,
        polygonOffsetUnits: 1,
      }),
    };
  }, [palette]);

  const accent = useMemo(() => new Color(palette.accent), [palette]);
  const muted = useMemo(() => new Color(palette.ink3), [palette]);

  useMotionValueEvent(progress, "change", () => invalidate());
  useMotionValueEvent(exaggeration, "change", () => invalidate());
  useEffect(() => invalidate(), [invalidate]);

  useFrame(() => {
    const p = progress.get();
    const t = geo.terrain;

    // Zoom in log space so apparent speed stays constant across ~60×.
    const zoomT = ramp(p, 0.06, 0.42);
    const z0 = size.width / 3400;
    const z1 = size.width / (t.width * 1.9);
    const tilt = ramp(p, 0.6, 0.92);
    const zoom =
      (Math.exp(lerp(Math.log(z0), Math.log(z1), zoomT)) *
        lerp(1, 1.08, tilt)) /
      // Pull back as the relief rises, so tall exaggerations stay in frame.
      (1 + 0.075 * ramp(p, 0.65, 0.95) * Math.max(0, exaggeration.get() - 1));

    const polar = lerp(0.0001, 1.02, tilt);
    const azimuth = lerp(0, -0.32, tilt);
    const tx = lerp(0, t.center[0], zoomT);
    const tz = lerp(0, -t.center[1], zoomT);
    const r = 1000;
    camera.position.set(
      tx + r * Math.sin(polar) * Math.sin(azimuth),
      r * Math.cos(polar),
      tz + r * Math.sin(polar) * Math.cos(azimuth)
    );
    camera.lookAt(tx, 0, tz);
    (camera as OrthographicCamera).zoom = zoom;
    camera.updateProjectionMatrix();
    // project() reads matrixWorldInverse; refresh it now rather than at render.
    camera.updateMatrixWorld();

    const fadeMap = 1 - ramp(p, 0.5, 0.62);
    mat.coast.opacity = lerp(0.9, 0.3, ramp(zoomT, 0.5, 1)) * fadeMap;
    mat.borders.opacity = lerp(0.45, 0.2, ramp(zoomT, 0.5, 1)) * fadeMap;
    mat.g10.opacity = 0.9 * (1 - ramp(zoomT, 0.35, 0.7));
    mat.g1.opacity = 0.9 * ramp(zoomT, 0.45, 0.85) * fadeMap;
    // The accent marks one thing per stage: Bulgaria → the Pirin box → Vihren.
    mat.bulgaria.color.copy(muted).lerp(accent, 1 - ramp(p, 0.33, 0.42));
    mat.bulgaria.opacity = fadeMap;
    mat.box.opacity = ramp(p, 0.33, 0.42);
    mat.box.color.copy(accent).lerp(muted, ramp(p, 0.78, 0.86));
    const contour = ramp(p, 0.45, 0.55) * (1 - ramp(p, 0.68, 0.82));
    mat.minor.opacity = 0.55 * contour;
    mat.index.opacity = contour;
    mat.ridge.opacity = ramp(p, 0.62, 0.72);

    const lift = Math.max(0.0001, ramp(p, 0.65, 0.95) * exaggeration.get());
    ridges.scale.y = lift;
    curtains.scale.y = lift;

    // Overlay: scale bar and the Vihren trig mark, positioned in screen space.
    const nice = niceKm(140 / zoom);
    if (overlay.scale.current && overlay.scaleLabel.current) {
      overlay.scale.current.style.width = `${nice * zoom}px`;
      overlay.scaleLabel.current.textContent = `${nice} km`;
    }
    if (overlay.trig.current) {
      v.set(t.vihren[0], t.vihrenH * lift, -t.vihren[1]).project(camera);
      overlay.trig.current.style.transform = `translate(${((v.x + 1) / 2) * size.width}px, ${((1 - v.y) / 2) * size.height}px)`;
    }
  });

  return (
    <>
      <lineSegments geometry={geo.g10} material={mat.g10} />
      <lineSegments geometry={geo.g1} material={mat.g1} />
      <lineSegments geometry={geo.coast} material={mat.coast} />
      <lineSegments geometry={geo.borders} material={mat.borders} />
      <lineSegments geometry={geo.bulgaria} material={mat.bulgaria} />
      <lineSegments geometry={geo.terrain.minor} material={mat.minor} />
      <lineSegments geometry={geo.terrain.index} material={mat.index} />
      <lineSegments geometry={geo.terrain.box} material={mat.box} />
      <mesh
        geometry={geo.terrain.curtain}
        material={mat.curtain}
        ref={setCurtains}
      />
      <lineSegments
        geometry={geo.terrain.lines}
        material={mat.ridge}
        ref={setRidges}
      />
    </>
  );
}

// Module-level handles keep useFrame free of refs-in-render churn.
let ridges: Seg | Object3D = new Object3D();
let curtains: Mesh | Object3D = new Object3D();
const setRidges = (o: Seg | null) => {
  if (o) {
    ridges = o;
  }
};
const setCurtains = (o: Mesh | null) => {
  if (o) {
    curtains = o;
  }
};
const v = new Vector3();

function niceKm(km: number) {
  const pow = 10 ** Math.floor(Math.log10(km));
  const n = km / pow;
  if (n >= 5) {
    return 5 * pow;
  }
  return (n >= 2 ? 2 : 1) * pow;
}

export function PirinScene(props: {
  progress: MotionValue<number>;
  exaggeration: MotionValue<number>;
  palette: Palette;
  overlay: PirinOverlay;
}) {
  const [data, setData] = useState<GeoData | null>(null);
  useEffect(() => {
    loadGeo().then(setData);
  }, []);

  return (
    <Canvas
      aria-hidden="true"
      camera={{ position: [0, 1000, 0.001], zoom: 0.2, near: 1, far: 5000 }}
      dpr={[1, 2]}
      flat
      frameloop="demand"
      gl={{ antialias: true, alpha: true }}
      orthographic
    >
      {data ? <Scene data={data} {...props} /> : null}
    </Canvas>
  );
}
