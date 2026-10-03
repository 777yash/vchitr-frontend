import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api, extractApiError } from '../api/client';
import { useLearningResource } from '../api/learning';
import './LearningCourse.css';

interface Note { id: string; courseId: string; courseTitle: string; chapterId: string; chapterTitle: string; question: string; answer: string; createdAt: string }

export default function SavedNotes() {
  const [offset, setOffset] = useState(0);
  const [query, setQuery] = useState('');
  const [course, setCourse] = useState('');
  const [chapter, setChapter] = useState('');
  const [error, setError] = useState('');
  const [confirm, setConfirm] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const params = new URLSearchParams({ offset: String(offset) });
  if (course) params.set('course_id', course);
  if (chapter) params.set('chapter_id', chapter);
  const { data, error: loadError, reload } = useLearningResource<{ notes: Note[]; hasMore: boolean }>('/notes?' + params);
  const { data: courses } = useLearningResource<{ courseId: string; title: string; chapters: { id: string; title: string }[] }[]>('/notes/catalog');
  async function remove(id: string) {
    setBusy(true); setError('');
    try { await api.delete('/learning/notes/' + id); setConfirm(null); reload(); }
    catch (err) { setError(extractApiError(err)); }
    finally { setBusy(false); }
  }
  return <main className="course-shell learning-surface">
    <Link to="/subjects/learning">← Learning</Link><p className="course-eyebrow">Your saved explanations</p><h1>Your notes.</h1>
    <p className="course-lead">Saved explanations, ready to revisit.</p>
    <div className="course-actions">
      <label>Course <select aria-label="Course" value={course} onChange={event => { setCourse(event.target.value); setChapter(''); setOffset(0); }}><option value="">All courses</option>{courses?.map(item => <option key={item.courseId} value={item.courseId}>{item.title}</option>)}</select></label>
      <label>Chapter <select aria-label="Chapter" value={chapter} disabled={!course} onChange={event => { setChapter(event.target.value); setOffset(0); }}><option value="">All chapters</option>{courses?.find(item => item.courseId === course)?.chapters.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label>
      <label>Search this page <input value={query} onChange={event => setQuery(event.target.value)} /></label>
    </div>
    {(error || loadError) && <p className="course-alert" role="alert">{error || loadError} <button className="course-text-button" onClick={reload}>Retry</button></p>}
    {!data && !loadError && <p role="status">Loading saved notes…</p>}
    {data?.notes.length === 0 && <section className="course-panel"><h2>No saved notes yet</h2><p>Open a chapter and save a completed tutor answer to start your collection.</p></section>}
    <div className="notes-grid">{data?.notes.filter(note => (note.question + ' ' + note.answer).toLowerCase().includes(query.toLowerCase())).map(note => <article className="course-panel" key={note.id}>
      <p className="course-eyebrow">{note.courseTitle} · {note.chapterTitle}</p><h2>{note.question}</h2><p className="tutor-answer">{note.answer}</p><p className="course-muted">Saved {new Date(note.createdAt).toLocaleString()}</p>
      {confirm === note.id ? <div role="group" aria-label="Confirm note deletion"><p>Delete this saved note? This cannot be undone.</p><div className="course-actions"><button className="course-button" disabled={busy} onClick={() => void remove(note.id)}>Confirm delete</button><button className="course-button" disabled={busy} onClick={() => setConfirm(null)}>Cancel</button></div></div>
        : <button className="course-button" onClick={() => setConfirm(note.id)}>Delete note…</button>}
    </article>)}</div>
    <div className="course-actions"><button className="course-button" disabled={offset === 0} onClick={() => setOffset(value => Math.max(0, value - 50))}>Previous</button><span>Page {Math.floor(offset / 50) + 1}</span><button className="course-button" disabled={!data?.hasMore} onClick={() => setOffset(value => value + 50)}>Next</button></div>
  </main>;
}
