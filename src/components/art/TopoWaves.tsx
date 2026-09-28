import React, { useMemo } from 'react';
import ArtSvg, { type ArtProps } from './ArtSvg';
import { contourRings, ridgeLines, toPath } from './geometry';

interface TopoWavesProps extends ArtProps {
  /** `ridge`: stacked terrain lines. `contour`: nested map-style loops. */
  variant?: 'ridge' | 'contour';
  /** Number of lines (ridge) or rings (contour). */
  lines?: number;
  intensity?: number;
  seed?: number;
}

/** Topographic line art. Ridges stretch to fill; contours crop to cover. */
const TopoWaves: React.FC<TopoWavesProps> = ({
  variant = 'ridge',
  lines,
  intensity = 0.6,
  seed = 1,
  ...art
}) => {
  const d = useMemo(
    () =>
      variant === 'contour'
        ? toPath(contourRings({ rings: lines ?? 18, intensity, seed }), true)
        : toPath(ridgeLines({ lines: lines ?? 32, intensity, seed })),
    [variant, lines, intensity, seed],
  );
  return (
    <ArtSvg
      viewBox="0 0 100 100"
      preserveAspectRatio={variant === 'contour' ? 'xMidYMid slice' : 'none'}
      {...art}
    >
      <path d={d} vectorEffect="non-scaling-stroke" />
    </ArtSvg>
  );
};

export default TopoWaves;
