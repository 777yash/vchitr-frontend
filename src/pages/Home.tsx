import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { me, logout, getStoredUser, getToken } from '../api/auth';
import './Home.css';

interface CurrentUser {
  username: string;
  email: string;
}

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<CurrentUser | null>(() => getStoredUser());

  useEffect(() => {
    if (!getToken()) {
      setUser(null);
      return;
    }
    let cancelled = false;
    me()
      .then((u) => {
        if (!cancelled) setUser({ username: u.username, email: u.email });
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Home Page Background Star Generation
  useEffect(() => {
    const generateStars = () => {
      const container = document.querySelector('.stars-container');
      if (!container) return;
      container.innerHTML = '';
      for (let i = 0; i < 200; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.width = star.style.height = `${Math.random() * 3}px`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.left = `${Math.random() * 100}%`;
        star.style.animationDuration = `${Math.random() * 3 + 2}s`;
        star.style.animationDelay = `${Math.random() * 2}s`;
        container.appendChild(star);
      }
    };
    generateStars();
  }, []);

  const handleLogout = () => {
    logout();
    setUser(null);
  };

  return (
    <div className="home-container">
      <div className="stars-container"></div>

      <div className="home-auth">
        {user ? (
          <>
            <span className="home-auth-user">Hi, {user.username}</span>
            <button className="home-auth-btn home-auth-ghost" onClick={handleLogout}>
              Log Out
            </button>
          </>
        ) : (
          <>
            <button
              className="home-auth-btn home-auth-ghost"
              onClick={() => navigate('/login')}
            >
              Log In
            </button>
            <button
              className="home-auth-btn home-auth-solid"
              onClick={() => navigate('/signup')}
            >
              Sign Up
            </button>
          </>
        )}
      </div>

      <div className="home-content">
        <h1 className="home-title">vCHITR</h1>
        <p className="home-subtitle">vCHITR keeps your thoughts in one place.</p>
        <div className="home-buttons">
          <button className="btn btn-primary" onClick={() => navigate('/subjects')}>
            Subjects
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/notes')}>
            Notes
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
