import React, { useEffect, useState, type ReactNode } from 'react';
import StarsBackground from './StarsBackground';
import { pickRandomLoadableImage } from '../utils/bgImage';

const DEFAULT_BG_IMAGES = [
  'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=auto&auto=format&fit=crop', // Math
  'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=auto&auto=format&fit=crop', // Science
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=auto&auto=format&fit=crop', // Comp sci
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=auto&auto=format&fit=crop', // Space
  'https://images.unsplash.com/photo-1546182990-dffeafbe841d?q=80&w=auto&auto=format&fit=crop',  // Animals (Lion)
  'https://images.unsplash.com/photo-1776793931921-a3967dba981d?q=80&w=auto&auto=format&fit=crop', // Japan Street
  'https://images.unsplash.com/photo-1776255076699-d2dc33434b16?q=80&w=auto&auto=format&fit=crop', // Forest road
  'https://images.unsplash.com/photo-1769921824660-648d69d2642a?q=80&w=auto&auto=format&fit=crop', // Planet
  'https://images.unsplash.com/photo-1776033615277-6834892c5042?q=80&w=auto&auto=format&fit=crop', // Ducky
  'https://images.unsplash.com/photo-1770988966999-73b6e59da002?q=80&w=auto&auto=format&fit=crop', // Giraffe
  'https://images.unsplash.com/photo-1771308135760-bc082885ddca?q=80&w=auto&auto=format&fit=crop', // Car
  'https://images.unsplash.com/photo-1769750685213-67ee9e56ab6e?q=80&w=auto&auto=format&fit=crop', // Abstract Travel
  'https://images.unsplash.com/photo-1771787616811-7ae7a73a31de?q=80&w=auto&auto=format&fit=crop', // Abstract Apartment yard
  'https://images.unsplash.com/photo-1768938941448-cd16dada9b90?q=80&w=auto&auto=format&fit=crop', // Street B&W
  'https://images.unsplash.com/photo-1769858277461-79192001c48a?q=80&w=auto&auto=format&fit=crop', // Cars snow
  'https://images.unsplash.com/photo-1760786841098-06a0a1a5d661?q=80&w=auto&auto=format&fit=crop', // Delivery Truck
  'https://images.unsplash.com/photo-1551033406-611cf9a28f67?q=80&w=auto&auto=format&fit=crop', // Code
  'https://images.unsplash.com/photo-1590796583326-afd3bb20d22d?q=80&w=auto&auto=format&fit=crop', // Anime
  'https://images.unsplash.com/photo-1568740184438-a505ac0506b8?q=80&w=auto&auto=format&fit=crop', // SNES
  'https://images.unsplash.com/photo-1672814650570-39c24b767393?q=80&w=auto&auto=format&fit=crop', // PS2
  'https://images.unsplash.com/photo-1574158622682-e40e69881006?q=80&w=auto&auto=format&fit=crop', // Cat
  'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?q=80&w=auto&auto=format&fit=crop', // Dog
];

interface RandomImageBackgroundProps {
  images?: string[];
  containerClassName?: string;
  overlayClassName?: string;
  children?: ReactNode;
}

/**
 * Picks a random image from the built-in list (or `images` prop if provided)
 * that actually loads and sets it as the container's CSS background. If every
 * image fails to load, falls back to the homepage starfield background.
 */
const RandomImageBackground: React.FC<RandomImageBackgroundProps> = ({
  images = DEFAULT_BG_IMAGES,
  containerClassName,
  overlayClassName,
  children,
}) => {
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [bgFailed, setBgFailed] = useState(false);
  const imagesKey = images.join('|');

  useEffect(() => {
    let cancelled = false;
    pickRandomLoadableImage(images).then((url) => {
      if (cancelled) return;
      if (url) {
        setBgImage(url);
        setBgFailed(false);
      } else {
        setBgImage(null);
        setBgFailed(true);
      }
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imagesKey]);

  return (
    <div
      className={containerClassName}
      style={{ backgroundImage: bgImage ? `url(${bgImage})` : 'none' }}
    >
      {bgFailed && <StarsBackground />}
      {overlayClassName && <div className={overlayClassName}></div>}
      {children}
    </div>
  );
};

export default RandomImageBackground;
