import React from 'react';
import ArtSvg, { type ArtProps } from './ArtSvg';

interface GlobeProps extends ArtProps {
  size?: number;
}

const MERIDIANS = [0.34, 0.72];
const PARALLELS = [-6, 6];

/** Wireframe globe mark: outline, equator, two parallels, three meridians. */
const Globe: React.FC<GlobeProps> = ({ size = 16, ...art }) => (
  <ArtSvg viewBox="0 0 24 24" width={size} height={size} {...art}>
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12H22M12 2V22" />
    {MERIDIANS.map((f) => (
      <ellipse key={f} cx="12" cy="12" rx={10 * f} ry="10" />
    ))}
    {PARALLELS.map((y) => (
      <path key={y} d={`M${12 - Math.sqrt(100 - y * y)} ${12 + y}H${12 + Math.sqrt(100 - y * y)}`} />
    ))}
  </ArtSvg>
);

export default Globe;
