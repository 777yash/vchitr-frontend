import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { me, logout, getStoredUser, getToken } from '../api/auth';
import './Navigation.css';

interface CurrentUser {
  username: string;
  email: string;
}

const Navigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : false;
    return saved === 'dark' || (!saved && prefersDark);
  });
  const [isOpen, setIsOpen] = useState(false);
  // Set default starting pos to match visual layout next to "vCHITR" brand (~120px)
  const [posX, setPosX] = useState(120);
  const [user, setUser] = useState<CurrentUser | null>(() =>
    getToken() ? getStoredUser() : null
  );
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startPosX = useRef(0);
  const dragged = useRef(false);
  const navRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Sync theme attribute with state
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    const handleToggle = () => setIsOpen(true);
    window.addEventListener('toggle-main-nav', handleToggle);
    return () => window.removeEventListener('toggle-main-nav', handleToggle);
  }, []);

  // Verify auth on mount + when route changes (catches login/logout from other pages)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!getToken()) {
        if (!cancelled) setUser(null);
        return;
      }
      try {
        const u = await me();
        if (!cancelled) setUser({ username: u.username, email: u.email });
      } catch {
        if (!cancelled) setUser(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [location.pathname]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen]);

  // Close on click outside (ignore trigger itself)
  useEffect(() => {
    if (!isOpen) return;
    const onClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (navRef.current?.contains(target)) return;
      if (triggerRef.current?.contains(target)) return;
      setIsOpen(false);
    };
    // Delay binding so the click that opened doesn't immediately close it
    const id = window.setTimeout(() => document.addEventListener('mousedown', onClick), 0);
    return () => {
      window.clearTimeout(id);
      document.removeEventListener('mousedown', onClick);
    };
  }, [isOpen]);

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      localStorage.setItem('theme', next ? 'dark' : 'light');
      return next;
    });
  };

  const toggleNav = () => {
    setIsOpen(!isOpen);
  };

  const closeNav = () => setIsOpen(false);

  const handleLogout = () => {
    logout();
    setUser(null);
    setIsOpen(false);
    navigate('/');
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

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const onHome = location.pathname === '/';
  const showHomeFloatingAuth = onHome && !isOpen;
  // Close X sits slightly left of the trigger's last known x-position
  const closeX = Math.max(0, posX + 8);

  const wrapperStyle = { '--trigger-x': `${posX}px` } as React.CSSProperties;

  return (
    <div
      className={`navigation-wrapper ${isOpen ? 'open' : ''}`}
      style={wrapperStyle}
    >
      {/* The visible trigger button to open */}
      <button
        ref={triggerRef}
        className="navbar-trigger"
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{ left: `${posX}px`, touchAction: 'none' }}
        aria-label="Open Navigation"
        aria-expanded={isOpen}
      >
        <span className="navbar-trigger-bars" aria-hidden="true">
          <span></span>
          <span></span>
          <span></span>
        </span>
      </button>

      {showHomeFloatingAuth && (
        <div className="home-floating-auth">
          {user ? (
            <>
              <span className="home-auth-user">Hi, {user.username}</span>
              <button
                className="home-auth-btn home-auth-ghost"
                onClick={handleLogout}
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="home-auth-btn home-auth-ghost">
                Log In
              </Link>
              <Link to="/signup" className="home-auth-btn home-auth-solid">
                Sign Up
              </Link>
            </>
          )}
        </div>
      )}

      <nav className="navbar" ref={navRef}>
        <button
          className="navbar-close-btn"
          onClick={toggleNav}
          aria-label="Close Navigation"
          style={{ left: `${closeX}px` }}
        >
          ✕
        </button>
        <div className="navbar-container">
          <Link to="/" className="navbar-logo" onClick={closeNav}>vCHITR</Link>
          <div className="navbar-links">
            <Link
              to="/subjects"
              className={`nav-link ${isActive('/subjects') ? 'active' : ''}`}
              aria-current={isActive('/subjects') ? 'page' : undefined}
              onClick={closeNav}
            >
              Subjects
            </Link>
            <Link
              to="/notes"
              className={`nav-link ${isActive('/notes') ? 'active' : ''}`}
              aria-current={isActive('/notes') ? 'page' : undefined}
              onClick={closeNav}
            >
              Notes
            </Link>
            <Link
              to="/faq"
              className={`nav-link ${isActive('/faq') ? 'active' : ''}`}
              aria-current={isActive('/faq') ? 'page' : undefined}
              onClick={closeNav}
            >
              FAQ
            </Link>
            <Link
              to="/contact"
              className={`nav-link ${isActive('/contact') ? 'active' : ''}`}
              aria-current={isActive('/contact') ? 'page' : undefined}
              onClick={closeNav}
            >
              Contact
            </Link>
          </div>
          <div className="navbar-actions">
            {user ? (
              <div className="navbar-auth">
                <span className="navbar-user" title={user.email}>
                  <span className="navbar-user-avatar" aria-hidden="true">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                  <span className="navbar-user-name">{user.username}</span>
                </span>
                <button
                  className="navbar-auth-btn navbar-auth-ghost"
                  onClick={handleLogout}
                >
                  Log Out
                </button>
              </div>
            ) : (
              <div className="navbar-auth">
                <Link
                  to="/login"
                  className="navbar-auth-btn navbar-auth-ghost"
                  onClick={closeNav}
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="navbar-auth-btn navbar-auth-solid"
                  onClick={closeNav}
                >
                  Sign Up
                </Link>
              </div>
            )}
            <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle Theme">
              {isDark ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navigation;
