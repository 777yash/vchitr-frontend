import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Navigation.css';

const Navigation: React.FC = () => {
  const [isDark, setIsDark] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

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

  const toggleTheme = () => {
    const newTheme = !isDark ? 'dark' : 'light';
    setIsDark(!isDark);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const toggleNav = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`navigation-wrapper ${isOpen ? 'open' : ''}`}>
      {/* The visible trigger button to open */}
      <button className="navbar-trigger" onClick={toggleNav} aria-label="Open Navigation">
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
