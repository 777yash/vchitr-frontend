import test from 'node:test';
import assert from 'node:assert/strict';
import {
  mulberry32,
  toPath,
  warpedGridLines,
  ridgeLines,
  contourRings,
  starRowSegments,
} from '../src/components/art/geometry.ts';

const finite = (lines) => lines.every((line) => line.every(([x, y]) => Number.isFinite(x) && Number.isFinite(y)));

test('seeded art is deterministic and seeds differ', () => {
  assert.equal(mulberry32(7)(), mulberry32(7)());
  assert.notEqual(mulberry32(7)(), mulberry32(8)());
  assert.equal(toPath(warpedGridLines({ seed: 3, warp: 'well' })), toPath(warpedGridLines({ seed: 3, warp: 'well' })));
  assert.notEqual(toPath(ridgeLines({ seed: 3 })), toPath(ridgeLines({ seed: 4 })));
});

test('warped grid draws every row and column with finite points', () => {
  for (const warp of ['wave', 'pinch', 'well']) {
    const lines = warpedGridLines({ cols: 10, rows: 6, samples: 20, warp, intensity: 1 });
    assert.equal(lines.length, 7 + 11);
    assert.ok(lines.every((line) => line.length === 21));
    assert.ok(finite(lines));
  }
});

test('pinch warp keeps the grid inside its box', () => {
  for (let seed = 1; seed <= 20; seed++) {
    const lines = warpedGridLines({ warp: 'pinch', intensity: 1, seed });
    assert.ok(lines.flat().every(([x, y]) => x >= -1e-9 && x <= 100 + 1e-9 && y >= -1e-9 && y <= 100 + 1e-9));
  }
});

test('zero intensity leaves a flat grid', () => {
  const [firstRow] = warpedGridLines({ rows: 4, intensity: 0, warp: 'wave' });
  assert.ok(firstRow.every(([, y]) => y === 0));
});

test('ridge lines stay stacked and never cross', () => {
  for (let seed = 1; seed <= 30; seed++) {
    const lines = ridgeLines({ seed, intensity: 1, lines: 48 });
    assert.ok(finite(lines));
    for (let n = 1; n < lines.length; n++) {
      for (let i = 0; i < lines[n].length; i++) assert.ok(lines[n][i][1] > lines[n - 1][i][1]);
    }
  }
});

test('contour rings are closed loops that stay nested', () => {
  const rings = contourRings({ rings: 12, samples: 64, intensity: 1, seed: 5 });
  assert.equal(rings.length, 12);
  const path = toPath(rings, true);
  assert.equal(path.match(/Z/g).length, 12);
  const centre = [rings[0].reduce((s, p) => s + p[0], 0) / 64, rings[0].reduce((s, p) => s + p[1], 0) / 64];
  const radius = (p) => Math.hypot(p[0] - centre[0], p[1] - centre[1]);
  for (let r = 1; r < rings.length; r++) {
    for (let i = 0; i < 64; i++) assert.ok(radius(rings[r][i]) > radius(rings[r - 1][i]));
  }
});

test('star row lays out three strokes per star within its width', () => {
  const segments = starRowSegments(4, 10, 4);
  assert.equal(segments.length, 12);
  const xs = segments.flat().map(([x]) => x);
  assert.ok(Math.min(...xs) >= 0 && Math.max(...xs) <= 4 * 10 + 3 * 4);
});

test('path serialisation is compact and skips degenerate lines', () => {
  assert.equal(toPath([[[0, 0], [1.006, -0.001]], [[5, 5]]]), 'M0 0L1.01 0');
});
