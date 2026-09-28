import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Crosshair, Globe, StarRow, TopoWaves, WarpedGrid } from '../components/art';
import './Home.css';
import { preloadSubjects } from '../api/modules';

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <main className="home-container">
      <div className="home-blueprint ui-grid-overlay" aria-hidden="true" />

      <div className="home-poster ui-container">
        <header className="home-meta" aria-hidden="true">
          <span className="ui-caption ui-caption--strong">VCH / Study system</span>
          <StarRow count={4} className="home-meta-stars" />
          <span className="ui-caption home-meta-mid">Notes · Lessons · Practice</span>
          <Globe size={18} className="home-meta-globe" />
        </header>

        <section className="home-hero">
          <div className="home-content">
            <p className="ui-caption home-kicker">[ 01 ] Class 10 maths pilot</p>
            <h1 className="home-title">vCHITR</h1>
            <p className="home-subtitle">vCHITR keeps your thoughts in one place.</p>
            <div className="home-buttons">
              <button className="ui-btn ui-btn--solid ui-btn--lg" onClick={() => navigate('/subjects/competitive')}>
                Competitive <span aria-hidden="true">→</span>
              </button>
              <button className="ui-btn ui-btn--lg" onPointerEnter={preloadSubjects} onFocus={preloadSubjects} onClick={() => { preloadSubjects(); navigate('/subjects/learning'); }}>
                Learning <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>

          <div className="home-art" aria-hidden="true">
            <div className="ui-window home-window home-window--main">
              <div className="ui-window__bar">
                <span>Fig. 01 / Field</span>
                <span className="ui-window__controls">□ □ ✕</span>
              </div>
              <div className="home-window-art">
                <WarpedGrid className="ui-art--fill" warp="well" intensity={0.95} cols={22} rows={22} seed={6} />
                <Crosshair size={28} ring className="home-focus" />
              </div>
            </div>
            <div className="ui-window home-window home-window--inset">
              <div className="ui-window__bar">
                <span>Fig. 02 / Terrain</span>
                <span className="ui-window__controls">✕</span>
              </div>
              <div className="home-window-art">
                <TopoWaves className="ui-art--fill" intensity={1} lines={26} seed={3} />
              </div>
            </div>
          </div>
        </section>

        <footer className="home-foot" aria-hidden="true">
          <span className="ui-caption">© 2026 vCHITR</span>
          <span className="home-ticks" />
          <span className="ui-caption">01 Competitive — 02 Learning</span>
        </footer>
      </div>
    </main>
  );
};

export default Home;
