import React, { useMemo } from 'react';
import ArtSvg, { type ArtProps } from './ArtSvg';
import { starRowSegments, toPath } from './geometry';

interface StarRowProps extends ArtProps {
  count?: number;
  /** Height of each star in pixels. */
  size?: number;
  gap?: number;
}

/** A row of six-point asterisks, the posters' rating-style ornament. */
const StarRow: React.FC<StarRowProps> = ({ count = 4, size = 10, gap = 4, ...art }) => {
  const d = useMemo(() => toPath(starRowSegments(count, size, gap)), [count, size, gap]);
  const width = count * size + Math.max(0, count - 1) * gap;
  return (
    <ArtSvg viewBox={`0 0 ${width} ${size}`} width={width} height={size} {...art}>
      <path d={d} />
    </ArtSvg>
  );
};

export default StarRow;
