import React, { useEffect, useRef } from 'react';
import './StarsBackground.css';

interface StarsBackgroundProps {
  count?: number;
}

const StarsBackground: React.FC<StarsBackgroundProps> = ({ count = 200 }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < count; i++) {
      const star = document.createElement('div');
      star.className = 'stars-bg-star';
      const size = `${Math.random() * 3}px`;
      star.style.width = size;
      star.style.height = size;
      star.style.top = `${Math.random() * 100}%`;
      star.style.left = `${Math.random() * 100}%`;
      star.style.animationDuration = `${Math.random() * 3 + 2}s`;
      star.style.animationDelay = `${Math.random() * 2}s`;
      container.appendChild(star);
    }
  }, [count]);

  return <div ref={ref} className="stars-background" aria-hidden="true" />;
};

export default StarsBackground;
