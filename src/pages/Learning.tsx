import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { api, extractApiError } from '../api/client';
import { saveLearningLevel, useLearningResource } from '../api/learning';
import { getStoredUser } from '../api/auth';
import { recommendation, testScores } from '../learning/progress';
import type { Attempt, Course, Lesson, SubjectPreference, Test } from '../learning/course';
import './LearningCourse.css';
import ConceptFeedback from '../components/ConceptFeedback';

function LoadingState({ error, retry }: { error?: string; retry: () => void }) {
  return error ? <div><p role="alert" className="course-alert">{error}</p><button className="course-button" onClick={retry}>Retry loading</button></div>
    : <p role="status">Loading from your account…</p>;
}

export default function Learning() {
  const { subjectName = 'Maths' } = useParams();
  return <SubjectCourse key={getStoredUser()?.email + ':' + subjectName} subjectName={subjectName} />;
}

function SubjectCourse({ subjectName }: { subjectName: string }) {
  const { data: subject, error, reload } = useLearningResource<SubjectPreference>('/subjects/' + encodeURIComponent(subjectName) + '?include_course=true');
  const [busy, setBusy] = useState(false);
  const [saveError, setSaveError] = useState('');
  async function selectLevel(level: string) {
    if (!subject) return;
    setBusy(true); setSaveError('');
    try { await saveLearningLevel(subject.subjectId, level); reload(); }
    catch (err) { setSaveError(extractApiError(err)); }
    finally { setBusy(false); }
  }
  if (subject?.course) return <CourseWorkspace key={subject.course.id} course={subject.course} reload={reload} />;
  // Backward compatible while the backend update rolls out.
  if (subject?.courseId) return <CourseLoader key={subject.courseId} courseId={subject.courseId} />;
  return <main className="course-shell">
    <Link to="/subjects/learning">← All subjects</Link>
    {!subject ? <LoadingState error={error} retry={reload} /> : <>
      <p className="course-eyebrow">Learning / {subject.subjectName}</p>
      <h1>Where would you like to begin?</h1>
      <p className="course-lead">Choose once. Your level is saved to your account for this subject. Change it later in Profile.</p>
      {saveError && <p className="course-alert" role="alert">{saveError}</p>}
      <div className="level-grid">{subject.levels.map((level) => <div className={'level-card ' + (level.available ? 'available' : '')} key={level.id}>
        <span className="course-eyebrow">{level.available ? 'Ready to study' : 'Coming soon'}</span>
        <h2>{level.title}</h2><p>{level.description}</p>
        <button className="course-button" disabled={busy || !level.available} onClick={() => selectLevel(level.id)}>{level.available ? busy ? 'Saving…' : 'Start ' + level.title.toLowerCase() + ' →' : 'Not available yet'}</button>
      </div>)}</div>
    </>}
  </main>;
}

function CourseLoader({ courseId }: { courseId: string }) {
  const { data, error, reload } = useLearningResource<Course>('/courses/' + courseId);
  return data ? <CourseWorkspace course={data} reload={reload} />
    : <main className="course-shell"><Link to="/subjects/learning">← All subjects</Link><LoadingState error={error} retry={reload} /></main>;
}

function CourseWorkspace({ course, reload }: { course: Course; reload: () => void }) {
  const [params, setParams] = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const chapterId = params.get('chapter');
  const testing = params.get('view') === 'test' || chapterId === 'final';
  const completed = course.chapters.filter((c) => testScores(course.progress.history, c.id).latest).length;
  const final = testScores(course.progress.history, 'final');
  function navigate(id?: string, test = false) {
    setParams(id ? { chapter: id, view: test ? 'test' : 'study' } : {});
    setSidebarOpen(false); window.scrollTo({ top: 0 });
  }
  async function reset() {
    setBusy(true); setError('');
    try { await api.post('/learning/courses/' + course.id + '/reset', { confirm: true }); setParams({}); reload(); }
    catch (err) { setError(extractApiError(err)); }
    finally { setBusy(false); }
  }
  return <div className="course-layout">
    <button className="course-mobile-menu course-button" onClick={() => setSidebarOpen(!sidebarOpen)} aria-expanded={sidebarOpen} aria-controls="course-navigation">{sidebarOpen ? 'Close chapters' : 'Browse chapters'}</button>
    <aside id="course-navigation" className={'course-sidebar ' + (sidebarOpen ? 'is-open' : '')} aria-label="Course chapters">
      <Link to="/profile">Change level in Profile</Link>
      <p className="course-eyebrow">Your saved course</p>
      <button className="course-overview-link" onClick={() => navigate()}>{course.title}</button>
      <p>{completed} / {course.chapters.length} chapter tests submitted</p>
      <progress value={completed} max={course.chapters.length} aria-label="Chapter tests submitted" />
      <nav>{course.chapters.map((chapter, i) => {
        const scores = testScores(course.progress.history, chapter.id);
        return <button className={'course-chapter-link ' + (chapterId === chapter.id ? 'active' : '')} key={chapter.id} aria-current={chapterId === chapter.id ? 'page' : undefined} onClick={() => navigate(chapter.id)}>
          <span>{String(i + 1).padStart(2, '0')}</span><span>{chapter.title}<small>{scores.latest ? 'Latest ' + scores.latest.percent + '% · Best ' + scores.best + '%' : course.progress.read.includes(chapter.id) ? 'Read · test pending' : 'Not started'}</small></span>
        </button>;
      })}</nav>
      <button className="course-button" onClick={() => navigate('final', true)}>Final test {course.progress.finalUnlocked ? '→' : '· Locked'}</button>
    </aside>
    <main className="course-main">
      <p className="course-storage-note">Your level, saved drafts and results are stored in your account across devices.</p>
      {chapterId ? params.get('view') === 'practice' ? <TestResource key={'practice-' + chapterId} courseId={course.id} testId={chapterId} adaptive reloadCourse={reload} onBack={() => navigate(chapterId)} />
        : testing ? <TestLoader key={chapterId} course={course} testId={chapterId} reloadCourse={reload} onBack={() => navigate(chapterId === 'final' ? undefined : chapterId)} />
        : <LessonLoader key={chapterId} course={course} chapterId={chapterId} onTest={() => navigate(chapterId, true)} reloadCourse={reload} />
        : <>
          <p className="course-eyebrow">Your learning path</p><h1>A little progress, every chapter.</h1>
          <p className="course-lead">{course.chapters.length} short lessons. Worked examples. A practice test for every chapter.</p>
          <div className="course-summary"><div><strong>{course.progress.read.length}</strong><span>lessons marked read</span></div><div><strong>{completed} / {course.chapters.length}</strong><span>chapter tests submitted</span></div><div><strong>{final.latest ? final.latest.percent + '%' : course.progress.finalUnlocked ? 'Unlocked' : 'Locked'}</strong><span>{final.latest ? 'final test · latest score' : 'final test'}</span></div></div>
          <section className="course-panel"><h2>Learn → practise → review</h2><p>Read at your own pace, then take chapter practice. Review explanations after submission. Submit all {course.chapters.length} chapter tests to unlock the final. No minimum score required.</p><p>These original NCERT-aligned notes are starter material. Use each chapter’s textbook link for full treatment and exercises.</p><button className="course-button primary" onClick={() => navigate(course.chapters.find((c) => !testScores(course.progress.history, c.id).latest)?.id ?? course.chapters[0].id)}>Continue learning →</button></section>
          <section className="course-panel"><h2>Final course test</h2><p>{final.latest ? 'Final submitted. Latest ' + final.latest.percent + '% · Best ' + final.best + '%.' : course.progress.finalUnlocked ? 'All chapter tests submitted. Your final is ready.' : (course.chapters.length - completed) + ' chapter tests remain.'}</p><button className="course-button" onClick={() => navigate('final', true)}>{final.latest ? 'Review final test' : course.progress.finalUnlocked ? 'Open final test' : 'View remaining chapters'}</button></section>
          <section className="course-panel"><h2>Reset test results</h2><p>Clear this course’s saved test drafts, attempts and scores. The final test will lock again. Your study level and read lessons are kept.</p>
            {!resetConfirm ? <button className="course-button" onClick={() => setResetConfirm(true)}>Reset results…</button>
              : <div role="alertdialog" aria-modal="false" aria-labelledby="reset-title"><h3 id="reset-title">Clear all test results for {course.title}?</h3><p>This cannot be undone. Results from other courses are kept.</p><div className="course-actions"><button className="course-button" disabled={busy} onClick={() => setResetConfirm(false)}>Cancel reset</button><button className="course-button" disabled={busy} onClick={reset}>{busy ? 'Resetting…' : 'Confirm reset'}</button></div></div>}
            {error && <p role="alert" className="course-alert">{error}</p>}
          </section>
        </>}
    </main>
  </div>;
}

function LessonLoader({ course, chapterId, onTest, reloadCourse }: { course: Course; chapterId: string; onTest: () => void; reloadCourse: () => void }) {
  const { data: lesson, error, reload } = useLearningResource<Lesson>('/courses/' + course.id + '/chapters/' + chapterId);
  const [busy, setBusy] = useState(false);
  const [saveError, setSaveError] = useState('');
  async function markRead() {
    setBusy(true); setSaveError('');
    try { await api.put('/learning/courses/' + course.id + '/chapters/' + chapterId + '/read'); reloadCourse(); }
    catch (err) { setSaveError(extractApiError(err)); }
    finally { setBusy(false); }
  }
  if (!lesson) return <><button className="course-text-button" onClick={reloadCourse}>Reload course</button><LoadingState error={error} retry={reload} /></>;
  const read = course.progress.read.includes(chapterId);
  return <article>
    <p className="course-eyebrow">{course.title} · Chapter {Number(chapterId.slice(3))}</p><h1>{lesson.title}</h1><p className="course-lead">{lesson.goal}</p>
    <a className="course-source" href={'https://ncert.nic.in/textbook/pdf/jemh1' + chapterId.slice(3) + '.pdf'} target="_blank" rel="noreferrer">Read the NCERT chapter ↗</a>
    <section className="course-panel"><h2>Core concepts</h2>{lesson.concepts.map((text) => <p key={text}>{text}</p>)}</section>
    <section className="course-panel worked-example"><p className="course-eyebrow">Worked example</p><h2>{lesson.example.problem}</h2><ol>{lesson.example.steps.map((text) => <li key={text}>{text}</li>)}</ol></section>
    <section className="course-panel"><h2>Watch for this</h2><p>{lesson.watchFor}</p></section>
    {saveError && <p role="alert" className="course-alert">{saveError}</p>}
    <div className="course-actions"><button className="course-button" disabled={read || busy} onClick={markRead}>{read ? '✓ Marked as read' : busy ? 'Saving…' : 'Mark as read'}</button><button className="course-button primary" onClick={onTest}>Open chapter practice →</button></div>
    <p className="course-muted">{lesson.questionCount} fixed questions · no time limit · explanations after submission.</p>
    {lesson.adaptiveAvailable && <Link className="course-button" to={'?chapter=' + chapterId + '&view=practice'}>Review concepts &amp; focused practice →</Link>}
  </article>;
}

function TestLoader({ course, testId, reloadCourse, onBack }: { course: Course; testId: string; reloadCourse: () => void; onBack: () => void }) {
  if (testId === 'final' && !course.progress.finalUnlocked) return <section>
    <h1>Final test is locked</h1><p>Submit every chapter test. No minimum score required.</p>
    <ul>{course.chapters.filter((c) => !testScores(course.progress.history, c.id).latest).map((c) => <li key={c.id}><Link to={'?chapter=' + c.id + '&view=test'}>{c.title} · test pending</Link></li>)}</ul>
    <button className="course-button" onClick={reloadCourse}>Refresh eligibility</button>
  </section>;
  return <TestResource courseId={course.id} testId={testId} reloadCourse={reloadCourse} onBack={onBack} />;
}

function TestResource({ courseId, testId, reloadCourse, onBack, adaptive = false }: { courseId: string; testId: string; reloadCourse: () => void; onBack: () => void; adaptive?: boolean }) {
  const { data, error, reload } = useLearningResource<Test>('/courses/' + courseId + (adaptive ? '/chapters/' + testId + '/practice' : '/tests/' + testId));
  return data ? <TestView key={data.attempt?.id ?? 'new'} initial={data} courseId={courseId} onSubmitted={reloadCourse} onBack={onBack} reload={reload} />
    : <><button className="course-text-button" onClick={onBack}>← Back to course</button><LoadingState error={error} retry={reload} /></>;
}

function TestView({ initial, courseId, onSubmitted, onBack, reload }: { initial: Test; courseId: string; onSubmitted: () => void; onBack: () => void; reload: () => void }) {
  const [attempt, setAttempt] = useState(initial.attempt);
  const [answers, setAnswers] = useState(initial.attempt?.answers ?? {});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState('');
  const [history, setHistory] = useState(initial.history);
  const [insights, setInsights] = useState(initial.insights);
  const adaptive = initial.kind === 'adaptive';
  const dirty = !!attempt && !attempt.submittedAt && JSON.stringify(answers) !== JSON.stringify(attempt.answers);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);
  async function start() {
    setBusy(true); setError(''); setSaved('');
    try {
      const { data } = await api.post<Attempt>('/learning/courses/' + courseId + (adaptive ? '/chapters/' + initial.testId + '/practice' : '/tests/' + initial.testId + '/attempts'));
      setAttempt(data); setAnswers(data.answers);
    } catch (err) { setError(extractApiError(err)); }
    finally { setBusy(false); }
  }
  async function save(submit: boolean) {
    if (!attempt) return;
    setBusy(true); setError(''); setSaved('');
    try {
      const path = '/learning/courses/' + courseId + '/attempts/' + attempt.id + (submit ? '/submit' : '/draft');
      const body = { answers, revision: attempt.revision };
      const { data } = submit ? await api.post<Attempt>(path, body) : await api.put<Attempt>(path, body);
      setAttempt(data); setAnswers(data.answers);
      if (submit) {
        if (adaptive && data.submittedAt && data.correct !== undefined && data.total !== undefined && data.percent !== undefined) {
          const result = { id: data.id, testId: data.testId, submittedAt: data.submittedAt, correct: data.correct, total: data.total, percent: data.percent, kind: data.kind, selection: data.selection };
          setHistory(items => items.some(item => item.id === result.id) ? items : [...items, result]);
          if (data.insights) setInsights(data.insights);
        } else onSubmitted();
        window.scrollTo({ top: 0 });
      }
      else setSaved('Draft saved to your account.');
    } catch (err) { setError(extractApiError(err)); }
    finally { setBusy(false); }
  }
  const scores = testScores(history, initial.testId);
  return <section>
    <button className="course-text-button" onClick={onBack}>← {initial.testId === 'final' ? 'Course overview' : 'Study material'}</button>
    <p className="course-eyebrow">{adaptive ? 'Practice selected from your recent answers' : initial.testId === 'final' ? 'One question from every chapter' : 'Chapter practice'}</p><h1>{initial.title}</h1>
    <p>{attempt?.questions.length ?? initial.questionCount} {adaptive && !attempt ? 'questions requested' : 'questions'} · 1 point each · no negative marking · no time limit</p>
    {scores.latest && !adaptive && <p>Latest {scores.latest.percent}% · Best {scores.best}%</p>}
    {adaptive && <p>Focused practice does not count as a chapter test or unlock the final. Difficulty stays within your saved education level.</p>}
    {adaptive && attempt?.selection && <div className="course-panel"><p>Focus: {attempt.selection.focusConcepts.join(', ')}</p><p>{Object.entries(attempt.selection.difficultyMix).map(([level, count]) => `${count} ${level}`).join(' · ')}</p><p>{attempt.selection.mode === 'revision' ? 'Revision set: these questions have been seen before and will not add fresh evidence.' : `${attempt.selection.freshCount} fresh questions. Previously seen questions are excluded.`}</p>{attempt.questions.length < 5 && <p>Shorter set: {attempt.questions.length} suitable questions available for this set.</p>}</div>}
    {error && <div className="course-alert" role="alert">{error}<button className="course-text-button" onClick={reload}>Reload saved test</button></div>}
    {saved && <p role="status">{saved}</p>}
    {insights && (!attempt || attempt.submittedAt) && <ConceptFeedback insights={insights} />}
    {!attempt ? <button className="course-button primary" disabled={busy} onClick={start}>{busy ? 'Starting…' : adaptive ? 'Start focused practice' : 'Start test'}</button>
      : attempt.submittedAt ? <>
        <div className="course-result" role="status"><strong>{attempt.correct} / {attempt.total} · {attempt.percent}%</strong><h2>{(attempt.percent ?? 0) >= 80 ? 'A strong start' : 'Keep building your understanding'}</h2><p>{adaptive ? 'Use the concept feedback to choose what to revise next.' : recommendation(attempt.percent ?? 0)}</p><p>This short test is a practice signal, not a complete measure of mastery.</p></div>
        <button className="course-button primary" disabled={busy} onClick={start}>{busy ? 'Starting…' : adaptive ? 'Continue focused practice' : 'Retry same questions'}</button>
        <p className="course-muted">{adaptive ? 'The next set adapts to fresh evidence. Sets at different difficulties are not directly comparable.' : 'Retakes use the same fixed questions.'} All attempts are kept until you reset course results.</p>
        {initial.adaptiveAvailable && <Link className="course-button" to={'?chapter=' + initial.testId + '&view=practice'}>Review weak concepts &amp; practise →</Link>}
        {attempt.questions.map((q, i) => <article className="course-panel" key={q.id}><p className="course-eyebrow">{q.concept} · {attempt.answers[q.id] === q.answer ? 'Correct' : 'Review this concept'}</p><h2>{i + 1}. {q.prompt}</h2><p>Your answer: {q.options[attempt.answers[q.id]]}</p><p><strong>Correct answer: {q.answer === undefined ? '' : q.options[q.answer]}</strong></p><p>{q.explanation}</p></article>)}
      </> : <form onSubmit={(e) => { e.preventDefault(); void save(true); }}>
        <p className="course-muted">Save your draft before leaving to resume on any device. Submission saves all answers.</p>
        {attempt.questions.map((q, i) => <fieldset className="course-question" key={q.id} disabled={busy}><legend>{i + 1}. {q.prompt}</legend><p className="course-eyebrow">{q.concept} · {q.difficulty}</p>
          {q.options.map((option, index) => <label className={'course-option ' + (answers[q.id] === index ? 'selected' : '')} key={option}><input type="radio" name={q.id} value={index} checked={answers[q.id] === index} onChange={() => { setAnswers({ ...answers, [q.id]: index }); setSaved(''); }} /><span>{String.fromCharCode(65 + index)}. {option}</span></label>)}
        </fieldset>)}
        <div className="course-actions"><span>{Object.keys(answers).length} / {attempt.questions.length} answered</span><button className="course-button" type="button" disabled={busy} onClick={() => void save(false)}>Save draft</button><button className="course-button primary" type="submit" disabled={busy}>{busy ? 'Saving…' : 'Submit test'}</button></div>
        {dirty && <p className="course-muted">Unsaved answer changes.</p>}
      </form>}
    {history.length > 0 && <details className="course-panel"><summary>{adaptive ? 'Focused practice history' : 'Attempt history'} ({history.length})</summary><ol>{history.map((item) => <li key={item.id}>{new Date(item.submittedAt).toLocaleString()} · {item.percent}%{item.kind === 'adaptive' && item.selection && <> · {item.selection.focusConcepts.join(', ')} · {Object.entries(item.selection.difficultyMix).map(([level, count]) => `${count} ${level}`).join(', ')} · {item.selection.mode === 'revision' ? 'Repeated revision' : 'Fresh practice'}</>}</li>)}</ol></details>}
  </section>;
}
