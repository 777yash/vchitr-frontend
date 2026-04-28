import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSubModules } from '../api/modules';
import type { SubModule } from '../api/modules';
import { extractApiError } from '../api/client';
import './SubjectSelection.css';

const SubjectSelection: React.FC = () => {
  const { mode } = useParams<{ mode: string }>();
  const navigate = useNavigate();
  const isLearning = mode === 'learning';

  const [subjects, setSubjects] = useState<SubModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLearning) return;
    setLoading(true);
    setError('');
    getSubModules()
      .then(setSubjects)
      .catch((err) => setError(extractApiError(err)))
      .finally(() => setLoading(false));
  }, [isLearning]);

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

      {loading && <p className="subsel-status">Loading...</p>}
      {error   && <p className="subsel-status subsel-error">{error}</p>}
      {!loading && !error && subjects.length === 0 && (
        <p className="subsel-status">No subjects found.</p>
      )}

      {!loading && !error && subjects.length > 0 && (
        <div className="subsel-grid">
          {subjects.map((s) => (
            <div
              key={s.sub_module_id}
              className="subsel-card"
              onClick={() => navigate(`/learning/${encodeURIComponent(s.sub_module_name)}`)}
            >
              <h2 className="subsel-name">{s.sub_module_name}</h2>
              {s.sub_module_description && (
                <p className="subsel-desc">{s.sub_module_description}</p>
              )}
              <div className="subsel-progress-wrap">
                <div className="subsel-progress-track">
                  <div className="subsel-progress-fill" style={{ width: '0%' }} />
                </div>
                <span className="subsel-progress-label">0%</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SubjectSelection;
