import React from 'react';
import { useNavigate } from 'react-router-dom';
import StarsBackground from '../components/StarsBackground';
import './Home.css';

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <StarsBackground />

      <div className="home-content">
        <h1 className="home-title">vCHITR</h1>
        <p className="home-subtitle">vCHITR keeps your thoughts in one place.</p>
        <div className="home-buttons">
          <button className="btn btn-primary" onClick={() => navigate('/subjects')}>
            Competitive
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/notes')}>
            Learning
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
