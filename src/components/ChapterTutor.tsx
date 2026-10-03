import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api, extractApiError } from '../api/client';
import { useLearningResource } from '../api/learning';

interface Turn { id: string; question: string; answer: string | null; status: 'pending' | 'ready' | 'failed'; helpful: boolean | null; flagged: boolean }

export default function ChapterTutor({ courseId, chapterId }: { courseId: string; chapterId: string }) {
  const path = '/courses/' + courseId + '/chapters/' + chapterId + '/doubts';
  const { data, error: loadError, reload } = useLearningResource<{ enabled: boolean; turns: Turn[] }>(path);
  const [question, setQuestion] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [request, setRequest] = useState<{ requestId: string; question: string } | null>(null);
  async function ask() {
    const body = request?.question === question.trim() ? request : { requestId: crypto.randomUUID(), question: question.trim() };
    setRequest(body); setBusy(true); setError(''); setMessage('');
    try {
      const { data: turn } = await api.post<Turn>('/learning' + path, body, { timeout: 60_000 });
      if (turn.status !== 'pending') { setQuestion(''); setRequest(null); }
      reload();
      if (turn.status === 'failed') setError('The provider could not answer. Your question is saved; retry with a new request or flag it for review.');
      if (turn.status === 'pending') setMessage('Answer still being prepared. Refresh conversation shortly.');
    } catch (err) { setError(extractApiError(err)); }
    finally { setBusy(false); }
  }
  async function act(turnId: string, action: 'helpful' | 'unhelpful' | 'flag' | 'save') {
    setBusy(true); setError(''); setMessage('');
    try {
      if (action === 'save') { await api.post('/learning/notes', { turnId }); setMessage('Saved to Notes.'); }
      else if (action === 'flag') { await api.post('/learning/doubts/' + turnId + '/flag'); setMessage('Flag recorded for manual review.'); reload(); }
      else { await api.put('/learning/doubts/' + turnId + '/feedback', { helpful: action === 'helpful' }); reload(); }
    } catch (err) { setError(extractApiError(err)); }
    finally { setBusy(false); }
  }
  return <section className="course-panel chapter-tutor" aria-labelledby="chapter-tutor-title">
    <h2 id="chapter-tutor-title">Ask your tutor</h2><p className="course-muted">Chapter-focused help. Check AI answers against the textbook.</p>
    {!data ? <p role="status">{loadError ?? 'Loading conversation…'} <button className="course-text-button" onClick={reload}>Retry</button></p>
      : <>
        {!data.enabled && <p role="status">Tutor generation is temporarily unavailable. Existing answers and Notes remain accessible.</p>}
        <div className="tutor-conversation" aria-label="Chapter conversation">{data.turns.map(turn => <article key={turn.id} className="tutor-turn">
          <h3>{turn.question}</h3><p className="tutor-answer">{turn.answer ?? (turn.status === 'pending' ? 'Answer pending. Refresh to check its status.' : 'The provider could not answer this question.')}</p>
          <div className="course-actions">
            {turn.status === 'ready' && <><button className="course-button" disabled={busy} aria-pressed={turn.helpful === true} onClick={() => void act(turn.id, 'helpful')}>Helpful</button>
              <button className="course-button" disabled={busy} aria-pressed={turn.helpful === false} onClick={() => void act(turn.id, 'unhelpful')}>Not helpful</button>
              <button className="course-button" disabled={busy} onClick={() => void act(turn.id, 'save')}>Save to Notes</button></>}
            <button className="course-button" disabled={busy || turn.flagged} onClick={() => void act(turn.id, 'flag')}>{turn.flagged ? 'Flagged for review' : 'Flag for review'}</button>
          </div>
        </article>)}</div>
        <form onSubmit={event => { event.preventDefault(); void ask(); }}>
          <label htmlFor="chapter-question">Your question</label>
          <textarea id="chapter-question" className="tutor-input" placeholder="Which step would you like to understand?" value={question} maxLength={2000} rows={3} disabled={busy || !data.enabled} onChange={event => setQuestion(event.target.value)} />
          <div className="course-actions"><button className="course-button primary" disabled={busy || !data.enabled || !question.trim()}>{busy ? 'Working…' : 'Ask tutor'}</button>
            <button className="course-button" type="button" disabled={busy} onClick={reload}>Refresh conversation</button><Link to="/notes">Open Notes ↗</Link></div>
        </form>
      </>}
    {(error || message) && <p role={error ? 'alert' : 'status'} className={error ? 'course-alert' : 'course-muted'}>{error || message}</p>}
  </section>;
}
