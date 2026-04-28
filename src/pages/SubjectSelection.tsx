import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './SubjectSelection.css';

const LEARNING_SUBJECTS = [
  { id: 'mathematics',     name: 'Mathematics',      description: 'Algebra, Geometry, Trigonometry, Statistics, Probability' },
  { id: 'science',         name: 'Science',           description: 'Physics, Chemistry, Biology, Earth Science, Astronomy' },
  { id: 'english',         name: 'English',           description: 'Grammar, Literature, Writing, Comprehension, Vocabulary' },
  { id: 'computer-science',name: 'Computer Science',  description: 'Data Structures, Algorithms, OS, Networks, Databases' },
  { id: 'history',         name: 'History',           description: 'Ancient, Medieval, Modern History, World Wars, Cold War' },
  { id: 'geography',       name: 'Geography',         description: 'Physical, Human Geography, Cartography, Climate, Ecosystems' },
];

const SubjectSelection: React.FC = () => {
  const { mode } = useParams<{ mode: string }>();
  const navigate = useNavigate();
  const isLearning = mode === 'learning';

  if (!isLearning) {
    return (
      <div className="subsel-container">
        <div className="subsel-header">
          <button className="subsel-back" onClick={() => navigate('/')}>← Back</button>
          <h1 className="subsel-title">Competitive</h1>
        </div>
        <div className="subsel-wip">
          <div className="subsel-wip-icon">🚧</div>
          <h2 className="subsel-wip-heading">Work in Progress</h2>
          <p className="subsel-wip-text">Competitive mode is coming soon.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="subsel-container">
      <div className="subsel-header">
        <button className="subsel-back" onClick={() => navigate('/')}>← Back</button>
        <h1 className="subsel-title">Learning</h1>
        <p className="subsel-subtitle">Select a subject to begin</p>
      </div>

      <div className="subsel-grid">
        {LEARNING_SUBJECTS.map((sub) => (
          <div
            key={sub.id}
            className="subsel-card"
            onClick={() => navigate(`/learning/${encodeURIComponent(sub.name)}`)}
          >
            <h2 className="subsel-name">{sub.name}</h2>
            <p className="subsel-desc">{sub.description}</p>
            <div className="subsel-progress-wrap">
              <div className="subsel-progress-track">
                <div className="subsel-progress-fill" style={{ width: '0%' }} />
              </div>
              <span className="subsel-progress-label">0%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubjectSelection;
