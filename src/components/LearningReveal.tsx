import { useEffect, useRef, type ReactNode } from 'react';

// Mini uses native browser animations and is fetched only inside learning views.
export default function LearningReveal({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (preference.matches) return;
    let disposed = false;
    let cancel: (() => void) | undefined;
    const stop = () => { cancel?.(); };
    preference.addEventListener('change', stop);
    void import('motion/mini').then(({ animate }) => {
      if (disposed || preference.matches || !ref.current) return;
      const animation = animate(ref.current, { opacity: [0.65, 1], transform: ['translateY(6px)', 'none'] },
        { duration: 0.22, ease: [0.22, 1, 0.36, 1] });
      cancel = () => animation.cancel();
    }).catch(() => { /* Content stays visible even if the optional animation chunk fails. */ });
    return () => { disposed = true; stop(); preference.removeEventListener('change', stop); };
  }, []);
  return <div className={className} ref={ref}>{children}</div>;
}
