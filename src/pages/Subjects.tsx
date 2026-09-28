import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TopoWaves, WarpedGrid } from '../components/art';
import './Subjects.css';

const Subjects: React.FC = () => {
  const navigate = useNavigate();

  const subjectsList = [
    { name: 'Mathematics', art: <TopoWaves className="ui-art--fill" variant="contour" lines={16} seed={5} /> },
    { name: 'Science', art: <WarpedGrid className="ui-art--fill" warp="well" intensity={0.9} seed={6} /> },
    { name: 'Computer Science', art: <WarpedGrid className="ui-art--fill" warp="wave" intensity={0.8} seed={2} /> },
  ];

  return (
    <div className="subjects-container">
      <div className="subjects-inner ui-container">
        <div className="subjects-header">
          <p className="ui-caption">[ Notes ] Index</p>
          <h1 className="subjects-title">Subjects</h1>
          <p className="subjects-subtitle">List of subjects</p>
        </div>

        <div className="subjects-grid">
          {subjectsList.map((sub, index) => (
            <button
              key={index}
              type="button"
              className="subject-card"
              onClick={() => navigate(`/notes/${encodeURIComponent(sub.name)}`)}
            >
              <span className="subject-card-figure" aria-hidden="true">{sub.art}</span>
              <span className="subject-card-overlay">
                <span className="subject-card-index" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                <span className="subject-card-name">{sub.name}</span>
                <span className="subject-card-cta" aria-hidden="true">Open notes →</span>
              </span>
            </button>
          ))}
        </div>

        <div className="notes-vault">
          <div className="vault-art" aria-hidden="true">
            <WarpedGrid className="ui-art--fill" warp="pinch" intensity={1} cols={24} rows={12} seed={4} />
          </div>
          <div className="vault-overlay">
            <p className="ui-caption">[ Vault ] All notes</p>
            <h2>Open your notes vault</h2>
            <p>Navigate through your notes.</p>
            <div className="vault-buttons">
              <button className="ui-btn ui-btn--solid ui-btn--lg" onClick={() => navigate('/notes')}>Open</button>
              <button className="ui-btn ui-btn--lg" onClick={() => navigate('/faq')}>Learn</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subjects;
