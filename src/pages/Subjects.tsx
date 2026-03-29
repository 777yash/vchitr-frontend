import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Subjects.css';

const Subjects: React.FC = () => {
  const navigate = useNavigate();

  const subjectsList = [
    {
      name: 'Mathematics',
      bgImage: 'url("https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=800&auto=format&fit=crop")',
    },
    {
      name: 'Science',
      bgImage: 'url("https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?q=80&w=800&auto=format&fit=crop")',
    },
    {
      name: 'Computer Science',
      bgImage: 'url("https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop")',
    }
  ];

  return (
    <div className="subjects-container">
      <div className="subjects-header">
        <h1 className="subjects-title">SUBJECTS</h1>
        <p className="subjects-subtitle">List of subjects</p>
      </div>

      <div className="subjects-grid">
        {subjectsList.map((sub, index) => (
          <div
            key={index}
            className="subject-card"
            style={{ backgroundImage: sub.bgImage }}
            onClick={() => navigate(`/notes/${encodeURIComponent(sub.name)}`)}
          >
            <div className="subject-card-overlay">
              <h2>{sub.name}</h2>
            </div>
          </div>
        ))}
      </div>

      <div className="notes-vault" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1517849845537-4d257902454a?q=80&w=1200&auto=format&fit=crop")' }}>
        <div className="vault-overlay">
          <h2>Open your notes vault</h2>
          <p>Navigate through your notes.</p>
          <div className="vault-buttons">
            <button className="btn btn-primary" onClick={() => navigate('/notes')}>Open</button>
            <button className="btn btn-outline" onClick={() => navigate('/faq')}>Learn</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subjects;
