import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getSubModules } from '../api/modules';
import type { SubModule } from '../api/modules';
import { extractApiError } from '../api/client';
import { api } from '../api/client';
import './SubjectSelection.css';
import './LearningCourse.css';
import LearningReveal from '../components/LearningReveal';
import LearningSkeleton from '../components/LearningSkeleton';

const SubjectSelection: React.FC = () => {
  const { mode } = useParams<{ mode: string }>();
  const isLearning = mode === 'learning';

  const [subjects, setSubjects] = useState<SubModule[]>([]);
  const [available, setAvailable] = useState<{ id: string; name: string; description: string }[]>([]);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!isLearning) return;
    let cancelled = false;
    api.get<{ id: string; name: string; description: string; enrolled: boolean }[]>('/learning/subjects')
      .then(({ data }) => {
        if (!cancelled) setAvailable(data.filter(item => !item.enrolled));
        return data.filter(item => item.enrolled).map(item => ({ sub_module_id: item.id, sub_module_name: item.name, sub_module_description: item.description, created_at: '' }));
      })
      .catch(err => { if ([404, 503].includes(err.response?.status) && /not enabled|Not Found/i.test(String(err.response?.data?.detail))) return getSubModules(); throw err; })
      .then((data) => {
        if (!cancelled) { setSubjects(data); setError(''); }
      })
      .catch((err) => { if (!cancelled) setError(extractApiError(err)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [isLearning, attempt]);

  function retry() { setLoading(true); setError(''); setAttempt((value) => value + 1); }

  async function enroll(id: string) {
    setBusy(true); setError('');
    try { await api.post('/learning/subjects/' + id + '/enroll'); retry(); }
    catch (err) { setError(extractApiError(err)); }
    finally { setBusy(false); }
  }

  if (!isLearning) {
    return (
      <div className="subsel-container">
        <div className="subsel-header">
          <Link className="subsel-back" to="/">← Back</Link>
          <h1 className="subsel-title">Competitive</h1>
        </div>
        <div className="subsel-wip">
          <div className="subsel-wip-icon" aria-hidden="true">🚧</div>
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
        <p className="subsel-status">No enrolled subjects yet. Choose an available subject below.</p>
      )}
      {available.length > 0 && <section><h2>Available subjects</h2><div className="subsel-grid">{available.map(subject => <article className="subsel-card" key={subject.id}><h3>{subject.name}</h3><p>{subject.description}</p><button className="course-button" disabled={busy} onClick={() => void enroll(subject.id)}>Enroll →</button></article>)}</div></section>}

      {!loading && !error && subjects.length > 0 && (
        <LearningReveal className="subsel-grid">
          {subjects.map((s) => (
            <Link
              key={s.sub_module_id}
              className="subsel-card"
              to={`/learning/${encodeURIComponent(s.sub_module_name)}`}
            >
              <span className="learning-subject-symbol" aria-hidden="true">{s.sub_module_name.toLowerCase().includes('math') ? '∑' : '↗'}</span>
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
