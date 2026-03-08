import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home: React.FC = () => {
  const navigate = useNavigate();

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

  return (
    <div className="home-container">
      <div className="stars-container"></div>
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
