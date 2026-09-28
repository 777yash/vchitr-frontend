import React, { useState, type ReactNode } from 'react';
import { TopoWaves, WarpedGrid } from './art';

interface RandomImageBackgroundProps {
  containerClassName?: string;
  overlayClassName?: string;
  children?: ReactNode;
}

type Composition = (seed: number) => ReactNode;

const COMPOSITIONS: Composition[] = [
  (seed) => <WarpedGrid className="ui-art--fill" warp="well" intensity={0.9} cols={28} rows={28} seed={seed} />,
  (seed) => <WarpedGrid className="ui-art--fill" warp="wave" intensity={0.8} cols={24} rows={24} seed={seed} />,
  (seed) => <TopoWaves className="ui-art--fill" variant="contour" lines={26} intensity={0.8} seed={seed} />,
  (seed) => <TopoWaves className="ui-art--fill" variant="ridge" lines={48} intensity={1} seed={seed} />,
];

function pickComposition() {
  return {
    draw: COMPOSITIONS[Math.floor(Math.random() * COMPOSITIONS.length)],
    seed: 1 + Math.floor(Math.random() * 1000),
  };
}

/**
 * Page backdrop: a randomly chosen line-art composition (warped grid or topographic lines),
 * picked once per mount. Drawn locally as SVG, so there is nothing to download or fail.
 */
const RandomImageBackground: React.FC<RandomImageBackgroundProps> = ({
  containerClassName,
  overlayClassName,
  children,
}) => {
  const [{ draw, seed }] = useState(pickComposition);

  return (
    <div className={containerClassName}>
      <div className="page-backdrop-art" aria-hidden="true">{draw(seed)}</div>
      {overlayClassName && <div className={overlayClassName}></div>}
      {children}
    </div>
  );
};

export default RandomImageBackground;
