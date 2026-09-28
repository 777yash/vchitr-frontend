import React from 'react';
import ArtSvg, { type ArtProps } from './ArtSvg';

interface CrosshairProps extends ArtProps {
  size?: number;
  /** Adds a small ring around the centre, like a registration mark. */
  ring?: boolean;
}

/** Registration crosshair for frame corners and focal points. */
const Crosshair: React.FC<CrosshairProps> = ({ size = 14, ring = false, ...art }) => (
  <ArtSvg viewBox="0 0 24 24" width={size} height={size} {...art}>
    <path d="M12 0V24M0 12H24" />
    {ring && <circle cx="12" cy="12" r="6" />}
  </ArtSvg>
);

export default Crosshair;
