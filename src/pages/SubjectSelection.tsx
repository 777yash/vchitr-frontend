import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getSubModules } from '../api/modules';
import type { SubModule } from '../api/modules';
import { extractApiError } from '../api/client';
import './SubjectSelection.css';
import './LearningCourse.css';
import LearningReveal from '../components/LearningReveal';
import LearningSkeleton from '../components/LearningSkeleton';
import { TopoWaves, WarpedGrid } from '../components/art';

const CARD_WARPS = ['well', 'wave', 'pinch'] as const;

const SubjectSelection: React.FC = () => {
  const { mode } = useParams<{ mode: string }>();
  const isLearning = mode === 'learning';

  const [subjects, setSubjects] = useState<SubModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!isLearning) return;
    let cancelled = false;
    getSubModules()
      .then((data) => {
        if (!cancelled) { setSubjects(data); setError(''); }
      })
      .catch((err) => { if (!cancelled) setError(extractApiError(err)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [isLearning, attempt]);

  function retry() { setLoading(true); setError(''); setAttempt((value) => value + 1); }

  if (!isLearning) {
    return (
      <div className="subsel-container">
        <div className="subsel-header">
          <Link className="subsel-back" to="/">← Back</Link>
          <h1 className="subsel-title">Competitive</h1>
        </div>
        <div className="subsel-wip">
          <div className="subsel-wip-icon" aria-hidden="true">
            <TopoWaves className="ui-art--fill" variant="contour" lines={14} seed={21} />
          </div>
          <p className="course-eyebrow subsel-wip-tag">[ 02 ] Under construction</p>
          <h2 className="subsel-wip-heading">Work in Progress</h2>
          <p className="subsel-wip-text">Competitive mode is coming soon.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="subsel-container learning-surface learning-selection">
      <div className="subsel-header">
        <Link className="subsel-back" to="/">← Back</Link>
        <p className="course-eyebrow">A little curiosity goes a long way</p>
        <h1 className="subsel-title">Make room for discovery.</h1>
        <p className="subsel-subtitle">Choose a subject. Find your pace. Build your understanding.</p>
      </div>

      {loading && <LearningSkeleton />}
      {error && (
        <div className="subsel-status subsel-error" role="alert">
          <p>{error}</p>
          <button className="course-button" onClick={retry}>Retry loading subjects</button>
        </div>
      )}
      {!loading && !error && subjects.length === 0 && (
        <p className="subsel-status">No subjects found.</p>
      )}

      {!loading && !error && subjects.length > 0 && (
        <LearningReveal className="subsel-grid">
          {subjects.map((s, i) => (
            <Link
              key={s.sub_module_id}
              className="subsel-card"
              to={`/learning/${encodeURIComponent(s.sub_module_name)}`}
            >
              <span className="subsel-figure" aria-hidden="true">
                <WarpedGrid className="ui-art--fill" warp={CARD_WARPS[i % CARD_WARPS.length]} intensity={0.9} seed={i + 2} />
                <span className="learning-subject-symbol">{s.sub_module_name.toLowerCase().includes('math') ? '∑' : '↗'}</span>
              </span>
              <span className="course-eyebrow">Your next discovery</span>
              <h2 className="subsel-name">{s.sub_module_name}</h2>
              {s.sub_module_description && (
                <p className="subsel-desc">{s.sub_module_description}</p>
              )}
              <span className="subsel-progress-label">Open learning →</span>
            </Link>
          ))}
        </LearningReveal>
      )}
    </div>
  );
};

export default SubjectSelection;
