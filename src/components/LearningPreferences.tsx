import { useState } from 'react';
import { Link } from 'react-router-dom';
import { saveLearningLevel, useLearningResource } from '../api/learning';
import { extractApiError } from '../api/client';
import type { SubjectPreference } from '../learning/course';

export default function LearningPreferences() {
  const { data, error, reload } = useLearningResource<SubjectPreference[]>('/preferences');
  return <section className="profile-learning" aria-labelledby="learning-preferences-title">
    <h2 id="learning-preferences-title">Learning preferences</h2>
    <p>Set a study level for each subject. Changing levels preserves your previous course progress.</p>
    {error ? <><p role="alert">{error}</p><button className="profile-btn profile-btn-ghost" onClick={reload}>Retry preferences</button></>
      : !data ? <p role="status">Loading learning preferences…</p>
        : data.length ? data.map((subject) => <PreferenceRow key={subject.subjectId + subject.selectedLevel} subject={subject} onSaved={reload} />)
          : <p>No learning subjects available yet.</p>}
  </section>;
}

function PreferenceRow({ subject, onSaved }: { subject: SubjectPreference; onSaved: () => void }) {
  const [level, setLevel] = useState(subject.selectedLevel ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function save() {
    setBusy(true); setError('');
    try { await saveLearningLevel(subject.subjectId, level); onSaved(); }
    catch (err) { setError(extractApiError(err)); }
    finally { setBusy(false); }
  }
  return <div className="profile-learning-row">
    <label htmlFor={'level-' + subject.subjectId}>{subject.subjectName}</label>
    <select id={'level-' + subject.subjectId} value={level} onChange={(e) => setLevel(e.target.value)} disabled={busy}>
      <option value="" disabled>Choose a level</option>
      {subject.levels.map((item) => <option key={item.id} value={item.id} disabled={!item.available}>{item.title + (item.available ? '' : ' · Coming soon')}</option>)}
    </select>
    <button className="profile-btn profile-btn-solid" disabled={busy || !level || level === subject.selectedLevel} onClick={save}>{busy ? 'Saving…' : 'Save level'}</button>
    {subject.courseId && <Link to={'/learning/' + encodeURIComponent(subject.subjectName)}>Open course →</Link>}
    {error && <p role="alert">{error}</p>}
  </div>;
}
