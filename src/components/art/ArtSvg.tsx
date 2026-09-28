import React from 'react';

export interface ArtProps {
  className?: string;
  /** Stroke width in screen pixels; stays constant however the art is scaled. */
  strokeWidth?: number;
}

interface ArtSvgProps extends ArtProps {
  viewBox: string;
  preserveAspectRatio?: string;
  width?: number;
  height?: number;
  children: React.ReactNode;
}

/** Decorative-only SVG shell: hidden from assistive tech, draws in currentColor. */
const ArtSvg: React.FC<ArtSvgProps> = ({
  className,
  strokeWidth = 1,
  viewBox,
  preserveAspectRatio,
  width,
  height,
  children,
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className ? `ui-art ${className}` : 'ui-art'}
    viewBox={viewBox}
    preserveAspectRatio={preserveAspectRatio}
    width={width}
    height={height}
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="square"
    strokeLinejoin="miter"
    aria-hidden="true"
    focusable="false"
  >
    {children}
  </svg>
);

export default ArtSvg;
