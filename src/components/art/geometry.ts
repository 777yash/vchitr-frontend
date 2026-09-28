// Pure, deterministic geometry for the decorative line-art components.
// No DOM or React here so it can be unit-tested directly with node:test.

export type Point = [number, number];
export type Polyline = Point[];

const TAU = Math.PI * 2;

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

/** Small seeded PRNG (mulberry32) so the same seed always draws the same art. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const fmt = (n: number) => (Math.round(n * 100) / 100).toString();

/** Serialise polylines into one compact SVG path (one DOM node per artwork). */
export function toPath(lines: readonly Polyline[], closed = false): string {
  let d = '';
  for (const line of lines) {
    if (line.length < 2) continue;
    for (let i = 0; i < line.length; i++) {
      d += `${i ? 'L' : 'M'}${fmt(line[i][0])} ${fmt(line[i][1])}`;
    }
    if (closed) d += 'Z';
  }
  return d;
}

export type GridWarp = 'wave' | 'pinch' | 'well';

export interface WarpedGridOptions {
  cols?: number;
  rows?: number;
  warp?: GridWarp;
  /** 0 = flat grid, 1 = strongest distortion. */
  intensity?: number;
  seed?: number;
  /** Points per grid line; higher is smoother. */
  samples?: number;
  width?: number;
  height?: number;
}

/**
 * A rectangular grid pushed through a displacement field.
 * `wave` ripples like cloth, `pinch` pulls toward a focal point,
 * `well` pinches and twists into a vortex. Radial warps never fold over.
 */
export function warpedGridLines(options: WarpedGridOptions = {}): Polyline[] {
  const {
    cols = 16,
    rows = 16,
    warp = 'wave',
    intensity = 0.5,
    seed = 1,
    samples = 32,
    width = 100,
    height = 100,
  } = options;
  const rand = mulberry32(seed);
  const phaseA = rand() * TAU;
  const phaseB = rand() * TAU;
  const cx = 0.35 + rand() * 0.3;
  const cy = 0.35 + rand() * 0.3;
  const k = clamp(intensity, 0, 1);

  const displace = (u: number, v: number): Point => {
    let x = u;
    let y = v;
    if (warp === 'wave') {
      x += k * 0.06 * Math.sin(TAU * (v * 1.1 + u * 0.25) + phaseA);
      y += k * 0.08 * Math.sin(TAU * (u * 0.9 + v * 0.3) + phaseB);
    } else {
      const dx = u - cx;
      const dy = v - cy;
      const falloff = Math.exp(-(dx * dx + dy * dy) / 0.06);
      const pull = 1 - k * 0.85 * falloff;
      let px = dx * pull;
      let py = dy * pull;
      if (warp === 'well') {
        const angle = k * 2.4 * falloff;
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        [px, py] = [px * c - py * s, px * s + py * c];
      }
      x = cx + px;
      y = cy + py;
    }
    return [x * width, y * height];
  };

  const lines: Polyline[] = [];
  for (let j = 0; j <= rows; j++) {
    const line: Polyline = [];
    for (let i = 0; i <= samples; i++) line.push(displace(i / samples, j / rows));
    lines.push(line);
  }
  for (let i = 0; i <= cols; i++) {
    const line: Polyline = [];
    for (let j = 0; j <= samples; j++) line.push(displace(i / cols, j / samples));
    lines.push(line);
  }
  return lines;
}

export interface RidgeOptions {
  lines?: number;
  intensity?: number;
  seed?: number;
  samples?: number;
  width?: number;
  height?: number;
}

/**
 * Horizontal lines lifted by a few smooth hills plus a long ripple,
 * like a wireframe terrain. Adjacent lines never cross.
 */
export function ridgeLines(options: RidgeOptions = {}): Polyline[] {
  const { lines = 32, intensity = 0.6, seed = 1, samples = 64, width = 100, height = 100 } = options;
  const rand = mulberry32(seed);
  const hills = Array.from({ length: 3 }, () => ({
    x: 0.2 + rand() * 0.6,
    y: 0.25 + rand() * 0.5,
    spread: 0.04 + rand() * 0.05,
    lift: 0.5 + rand() * 0.5,
  }));
  const phase = rand() * TAU;
  const amp = clamp(intensity, 0, 1) * 0.16;
  const gap = 0.002;

  const field = (u: number, v: number) => {
    let h = 0.25 * Math.sin(TAU * (u * 1.3 + v * 0.5) + phase);
    for (const hill of hills) {
      const dx = u - hill.x;
      const dy = v - hill.y;
      h += hill.lift * Math.exp(-(dx * dx + dy * dy) / hill.spread);
    }
    return h;
  };

  const out: Polyline[] = [];
  let previous: number[] | null = null;
  for (let n = 0; n < lines; n++) {
    const v = (n + 0.5) / lines;
    const ys: number[] = [];
    const line: Polyline = [];
    for (let i = 0; i <= samples; i++) {
      const u = i / samples;
      let y = v - amp * field(u, v);
      if (previous) y = Math.max(y, previous[i] + gap);
      ys.push(y);
      line.push([u * width, y * height]);
    }
    previous = ys;
    out.push(line);
  }
  return out;
}

export interface ContourOptions {
  rings?: number;
  intensity?: number;
  seed?: number;
  samples?: number;
  size?: number;
}

/**
 * Nested, irregular closed loops like a topographic map.
 * Every ring shares one wobble profile (with slow drift), so rings stay nested.
 */
export function contourRings(options: ContourOptions = {}): Polyline[] {
  const { rings = 18, intensity = 0.6, seed = 1, samples = 96, size = 100 } = options;
  const rand = mulberry32(seed);
  const cx = 0.4 + rand() * 0.2;
  const cy = 0.4 + rand() * 0.2;
  const k = clamp(intensity, 0, 1);
  const harmonics = [2, 3, 5].map((m) => ({ m, amp: (0.05 + rand() * 0.07) * k, phase: rand() * TAU }));
  const maxRadius = 0.78;

  const out: Polyline[] = [];
  for (let r = 1; r <= rings; r++) {
    const base = (maxRadius * r) / rings;
    const drift = r * 0.06 * k;
    const line: Polyline = [];
    for (let i = 0; i < samples; i++) {
      const theta = (i / samples) * TAU;
      let wobble = 1;
      for (const h of harmonics) wobble += h.amp * Math.sin(h.m * theta + h.phase + drift);
      const radius = base * wobble;
      line.push([(cx + Math.cos(theta) * radius) * size, (cy + Math.sin(theta) * radius) * size]);
    }
    out.push(line);
  }
  return out;
}

/** Asterisk stars (three strokes each) laid out in a row. */
export function starRowSegments(count: number, size: number, gap: number): Polyline[] {
  const out: Polyline[] = [];
  const r = size / 2;
  for (let s = 0; s < count; s++) {
    const cx = s * (size + gap) + r;
    for (let a = 0; a < 3; a++) {
      const angle = Math.PI / 2 + (a * Math.PI) / 3;
      const dx = Math.cos(angle) * r;
      const dy = Math.sin(angle) * r;
      out.push([[cx - dx, r - dy], [cx + dx, r + dy]]);
    }
  }
  return out;
}
