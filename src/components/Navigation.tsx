import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './Navigation.css';

const Navigation: React.FC = () => {
  const [isDark, setIsDark] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  // Set default starting pos to match visual layout next to "vCHITR" brand (~120px)
  const [posX, setPosX] = useState(120);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startPosX = useRef(0);
  const dragged = useRef(false);

  useEffect(() => {
    // Check initial preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDark(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      setIsDark(false);
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, []);

  useEffect(() => {
    const handleToggle = () => setIsOpen(true);
    window.addEventListener('toggle-main-nav', handleToggle);
    return () => window.removeEventListener('toggle-main-nav', handleToggle);
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark ? 'dark' : 'light';
    setIsDark(!isDark);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const toggleNav = () => {
    setIsOpen(!isOpen);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    dragged.current = false;
    startX.current = e.clientX;
    startPosX.current = posX;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - startX.current;
    if (Math.abs(dx) > 3) dragged.current = true;
    
    let newX = startPosX.current + dx;
    // Bound to screen (button is ~50px wide)
    newX = Math.max(0, Math.min(newX, window.innerWidth - 50));
    setPosX(newX);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (dragged.current) {
      e.stopPropagation();
      e.preventDefault();
      return;
    }
    toggleNav();
  };

  return (
    <div className={`navigation-wrapper ${isOpen ? 'open' : ''}`}>
      {/* The visible trigger button to open */}
      <button 
        className="navbar-trigger" 
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{ left: `${posX}px`, touchAction: 'none' }}
        aria-label="Open Navigation"
      >
        ☰
      </button>
      
      <nav className="navbar">
        <div className="navbar-container">
          <button className="navbar-close-btn" onClick={toggleNav} aria-label="Close Navigation">
            ✕
          </button>
          <Link to="/" className="navbar-logo" onClick={() => setIsOpen(false)}>vCHITR</Link>
          <div className="navbar-links">
            <Link to="/subjects" className="nav-link" onClick={() => setIsOpen(false)}>Subjects</Link>
            <Link to="/notes" className="nav-link" onClick={() => setIsOpen(false)}>Notes</Link>
            <Link to="/faq" className="nav-link" onClick={() => setIsOpen(false)}>FAQ</Link>
            <Link to="/contact" className="nav-link" onClick={() => setIsOpen(false)}>Contact</Link>
          </div>
          <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle Theme">
            {isDark ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Navigation;
