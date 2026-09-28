import React, { useMemo } from 'react';
import ArtSvg, { type ArtProps } from './ArtSvg';
import { toPath, warpedGridLines, type GridWarp } from './geometry';

interface WarpedGridProps extends ArtProps {
  cols?: number;
  rows?: number;
  warp?: GridWarp;
  intensity?: number;
  seed?: number;
}

/** Wireframe mesh pushed through a wave, pinch or vortex distortion. Fills its container. */
const WarpedGrid: React.FC<WarpedGridProps> = ({
  cols = 16,
  rows = 16,
  warp = 'wave',
  intensity = 0.5,
  seed = 1,
  ...art
}) => {
  const d = useMemo(
    () => toPath(warpedGridLines({ cols, rows, warp, intensity, seed })),
    [cols, rows, warp, intensity, seed],
  );
  // The wave warp pulls outer lines inward; crop past them so the mesh bleeds off every edge.
  const viewBox = warp === 'wave' ? '8 8 84 84' : '0 0 100 100';
  return (
    <ArtSvg viewBox={viewBox} preserveAspectRatio="none" {...art}>
      <path d={d} vectorEffect="non-scaling-stroke" />
    </ArtSvg>
  );
};

export default WarpedGrid;
