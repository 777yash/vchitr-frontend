import { useEffect, useRef, useState } from 'react';
import { Link, useBlocker, useParams, useSearchParams, type To } from 'react-router-dom';
import { api, extractApiError } from '../api/client';
import { saveLearningLevel, useLearningResource } from '../api/learning';
import { getStoredUser } from '../api/auth';
import { recommendation, testScores } from '../learning/progress';
import type { Attempt, Course, Lesson, SubjectPreference, Test } from '../learning/course';
import './LearningCourse.css';
import ConceptFeedback from '../components/ConceptFeedback';
import LessonContent from '../components/LessonContent';
import LearningReveal from '../components/LearningReveal';
import LearningSkeleton from '../components/LearningSkeleton';

const percentFormat = new Intl.NumberFormat(undefined, { style: 'percent', maximumFractionDigits: 0 });
const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' });
const percent = (value: number) => percentFormat.format(value / 100);
// Course views live in the query string so every view is a real, shareable link.
const courseHref = (chapter?: string, view: 'study' | 'test' | 'practice' = 'study'): To =>
  ({ search: chapter ? '?chapter=' + chapter + '&view=' + view : '' });

function LoadingState({ error, retry }: { error?: string; retry: () => void }) {
  return error ? <div><p role="alert" className="course-alert">{error}</p><button className="course-button" onClick={retry}>Retry loading</button></div>
    : <LearningSkeleton />;
}

export default function Learning() {
  const { subjectName = 'Maths' } = useParams();
  return <SubjectCourse key={getStoredUser()?.email + ':' + subjectName} subjectName={subjectName} />;
}

function SubjectCourse({ subjectName }: { subjectName: string }) {
  const { data: subject, error, reload } = useLearningResource<SubjectPreference>('/subjects/' + encodeURIComponent(subjectName) + '?include_course=true');
  const [savingLevel, setSavingLevel] = useState<string | null>(null);
  const [saveError, setSaveError] = useState('');
  async function selectLevel(level: string) {
    if (!subject) return;
    setSavingLevel(level); setSaveError('');
    try { await saveLearningLevel(subject.subjectId, level); reload(); }
    catch (err) { setSaveError(extractApiError(err)); }
    finally { setSavingLevel(null); }
  }
  if (subject?.course) return <CourseWorkspace key={subject.course.id} course={subject.course} reload={reload} />;
  // Backward compatible while the backend update rolls out.
  if (subject?.courseId) return <CourseLoader key={subject.courseId} courseId={subject.courseId} />;
  return <main className="course-shell learning-surface">
    <Link to="/subjects/learning">← All subjects</Link>
    {!subject ? <LoadingState error={error} retry={reload} /> : <LearningReveal>
      <p className="course-eyebrow">Learning / {subject.subjectName}</p>
      <h1>Where would you like to begin?</h1>
      <p className="course-lead">Choose once. Your level is saved to your account for this subject. Change it later in Profile.</p>
      {saveError && <p className="course-alert" role="alert">{saveError}</p>}
      <div className="level-grid">{subject.levels.map((level) => <div className={'level-card ' + (level.available ? 'available' : '')} key={level.id}>
        <span className="course-eyebrow">{level.available ? 'Ready to study' : 'Coming soon'}</span>
        <h2>{level.title}</h2><p>{level.description}</p>
        <button className="course-button" disabled={savingLevel !== null || !level.available} onClick={() => selectLevel(level.id)}>{level.available ? savingLevel === level.id ? 'Saving…' : 'Start ' + level.title.toLowerCase() + ' →' : 'Not available yet'}</button>
      </div>)}</div>
    </LearningReveal>}
  </main>;
}

function CourseLoader({ courseId }: { courseId: string }) {
  const { data, error, reload } = useLearningResource<Course>('/courses/' + courseId);
  return data ? <CourseWorkspace course={data} reload={reload} />
    : <main className="course-shell learning-surface"><Link to="/subjects/learning">← All subjects</Link><LoadingState error={error} retry={reload} /></main>;
}

function CourseWorkspace({ course, reload }: { course: Course; reload: () => void }) {
  const [params, setParams] = useSearchParams();
  const chapterDialog = useRef<HTMLDialogElement>(null);
  const main = useRef<HTMLElement>(null);
  const resetTrigger = useRef<HTMLButtonElement>(null);
  const cancelReset = useRef<HTMLButtonElement>(null);
  const resetToggled = useRef(false);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const chapterId = params.get('chapter');
  const testing = params.get('view') === 'test' || chapterId === 'final';
  const completed = course.chapters.filter((c) => testScores(course.progress.history, c.id).latest).length;
  const final = testScores(course.progress.history, 'final');
  const nextChapter = course.chapters.find((c) => !testScores(course.progress.history, c.id).latest);
  const viewKey = (chapterId ?? 'overview') + ':' + (params.get('view') ?? '');
  const lastViewKey = useRef(viewKey);
  useEffect(() => {
    if (lastViewKey.current === viewKey) return;
    lastViewKey.current = viewKey;
    // The previous view unmounts, so move focus to the new content instead of losing it.
    window.scrollTo({ top: 0 });
    main.current?.focus({ preventScroll: true });
  }, [viewKey]);
  useEffect(() => {
    if (!resetToggled.current) return;
    (resetConfirm ? cancelReset : resetTrigger).current?.focus();
  }, [resetConfirm]);
  function toggleReset(open: boolean) { resetToggled.current = true; setResetConfirm(open); }
  async function reset() {
    setBusy(true); setError('');
    try { await api.post('/learning/courses/' + course.id + '/reset', { confirm: true }); setParams({}); toggleReset(false); reload(); }
    catch (err) { setError(extractApiError(err)); }
    finally { setBusy(false); }
  }
  const chapterNavigation = <>
      <Link className="course-back-link" to="/subjects/learning">← All subjects</Link>
      <p className="course-eyebrow">Your saved course</p>
      <Link className="course-overview-link" to={courseHref()}>{course.title}</Link>
      <p>{completed} / {course.chapters.length} chapter tests submitted</p>
      <progress value={completed} max={course.chapters.length} aria-label="Chapter tests submitted" />
      <nav>{course.chapters.map((chapter, i) => {
        const scores = testScores(course.progress.history, chapter.id);
        return <Link className={'course-chapter-link ' + (chapterId === chapter.id ? 'active' : '')} key={chapter.id} aria-current={chapterId === chapter.id ? 'page' : undefined} to={courseHref(chapter.id)}>
          <span className="course-chapter-number">{String(i + 1).padStart(2, '0')}</span><span>{chapter.title}<small>{scores.latest ? '✓ Latest ' + percent(scores.latest.percent) + ' · Best ' + percent(scores.best ?? 0) : course.progress.read.includes(chapter.id) ? 'Read · test pending' : 'Not started'}</small></span>
        </Link>;
      })}</nav>
      <Link className="course-button" to={courseHref('final', 'test')}>Final test {course.progress.finalUnlocked ? '→' : '· Locked'}</Link>
      <Link className="course-profile-link" to="/profile">Change level in Profile ↗</Link>
  </>;
  return <div className="course-layout learning-surface">
    <a className="course-button course-skip-link" href="#course-main">Skip to lesson</a>
    <button className="course-mobile-menu course-button" onClick={() => chapterDialog.current?.showModal()} aria-haspopup="dialog" aria-controls="course-navigation">Browse chapters <span aria-hidden="true">☰</span></button>
    <aside className="course-sidebar" aria-label="Course chapters">{chapterNavigation}</aside>
    <dialog ref={chapterDialog} id="course-navigation" className="course-chapter-dialog" aria-label="Course chapters" onClick={(event) => { if (event.target === event.currentTarget || (event.target as Element).closest('a')) chapterDialog.current?.close(); }}>
      <div className="course-drawer-inner"><button className="course-button course-drawer-close" onClick={() => chapterDialog.current?.close()}>Close chapters <span aria-hidden="true">×</span></button>{chapterNavigation}</div>
    </dialog>
    <main className="course-main" id="course-main" tabIndex={-1} ref={main}>
      <div className="course-workspace-header"><nav aria-label="Breadcrumb"><Link to="/subjects/learning">Learning</Link><span aria-hidden="true">/</span><Link to={courseHref()}>{course.title}</Link></nav><span className="course-account-badge">Saved to your account</span></div>
      <LearningReveal key={viewKey}>
      {chapterId ? params.get('view') === 'practice' ? <TestResource key={'practice-' + chapterId} courseId={course.id} testId={chapterId} adaptive reloadCourse={reload} backTo={courseHref(chapterId)} />
        : testing ? <TestLoader key={chapterId} course={course} testId={chapterId} reloadCourse={reload} backTo={courseHref(chapterId === 'final' ? undefined : chapterId)} />
        : <LessonLoader key={chapterId} course={course} chapterId={chapterId} reloadCourse={reload} />
        : <>
          <p className="course-eyebrow">Your learning path</p><h1>A little progress, every chapter.</h1>
          <p className="course-lead">{course.chapters.length} short lessons. Worked examples. A practice test for every chapter.</p>
          <div className="course-summary"><div><strong>{course.progress.read.length}</strong><span>lessons marked read</span></div><div><strong>{completed} / {course.chapters.length}</strong><span>chapter tests submitted</span></div><div><strong>{final.latest ? percent(final.latest.percent) : course.progress.finalUnlocked ? 'Unlocked' : 'Locked'}</strong><span>{final.latest ? 'final test · latest score' : 'final test'}</span></div></div>
          <section className="course-panel course-continue"><p className="course-eyebrow">Your next chapter</p><h2>{nextChapter?.title ?? 'Keep your knowledge fresh'}</h2><p>Read at your own pace. Work through an example, then put it into practice.</p><Link className="course-button primary" to={courseHref((nextChapter ?? course.chapters[0]).id)}>Continue learning →</Link><span className="course-orbit" aria-hidden="true">∑</span></section>
          <section className="course-panel"><h2>Your chapters</h2><p className="course-muted">Learn → practise → review. Submit all {course.chapters.length} chapter tests to unlock the final. No minimum score required.</p><div className="course-chapter-list">{course.chapters.map((chapter, index) => <Link className="course-chapter-row" key={chapter.id} to={courseHref(chapter.id)}><span className="course-chapter-number">{String(index + 1).padStart(2, '0')}</span><span>{chapter.title}<small>{testScores(course.progress.history, chapter.id).latest ? '✓ Test submitted' : course.progress.read.includes(chapter.id) ? 'Read · test pending' : 'Ready to explore'}</small></span><span aria-hidden="true">↗</span></Link>)}</div><p className="course-muted">Original NCERT-aligned starter notes. Each lesson links to the textbook for full treatment and exercises.</p></section>
          <section className="course-panel"><h2>Final course test</h2><p>{final.latest ? 'Final submitted. Latest ' + percent(final.latest.percent) + ' · Best ' + percent(final.best ?? 0) + '.' : course.progress.finalUnlocked ? 'All chapter tests submitted. Your final is ready.' : (course.chapters.length - completed) + ' chapter tests remain.'}</p><Link className="course-button" to={courseHref('final', 'test')}>{final.latest ? 'Review final test' : course.progress.finalUnlocked ? 'Open final test' : 'View remaining chapters'}</Link></section>
          <details className="course-panel course-management"><summary>Manage course results</summary><h2>Reset test results</h2><p>Clear this course’s saved test drafts, attempts and scores. The final test will lock again. Your study level and read lessons are kept.</p>
            {!resetConfirm ? <button className="course-button" ref={resetTrigger} onClick={() => toggleReset(true)}>Reset results…</button>
              : <div role="alertdialog" aria-modal="false" aria-labelledby="reset-title"><h3 id="reset-title">Clear all test results for {course.title}?</h3><p>This cannot be undone. Results from other courses are kept.</p><div className="course-actions"><button className="course-button" ref={cancelReset} disabled={busy} onClick={() => toggleReset(false)}>Cancel reset</button><button className="course-button" disabled={busy} onClick={reset}>{busy ? 'Resetting…' : 'Confirm reset'}</button></div></div>}
            {error && <p role="alert" className="course-alert">{error}</p>}
          </details>
        </>}
      </LearningReveal>
    </main>
  </div>;
}

function LessonLoader({ course, chapterId, reloadCourse }: { course: Course; chapterId: string; reloadCourse: () => void }) {
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
  return <LearningReveal><article className="course-lesson">
    <p className="course-eyebrow">{course.title} · Chapter {Number(chapterId.slice(3))}</p><h1>{lesson.title}</h1><p className="course-lead">{lesson.goal}</p>
    <a className="course-source" href={'https://ncert.nic.in/textbook/pdf/jemh1' + chapterId.slice(3) + '.pdf'} target="_blank" rel="noreferrer">Read the NCERT chapter ↗</a>
    {lesson.contentVariant && <div className="course-panel course-depth">
      <h2>Explanation depth: {lesson.contentVariant.servedTier === 'beginner' ? 'Beginner · more guidance' : lesson.contentVariant.servedTier === 'advanced' ? 'Advanced · deeper exploration' : 'Default · original lesson'}</h2>
      <p className="course-muted">{lesson.contentVariant.selection.reason === 'more-evidence-needed'
        ? 'Starting with the original lesson while we collect more answers across this chapter’s concepts.'
        : 'Selected from your recent first answers to distinct chapter questions. Repeating questions does not add evidence.'} Your saved education level stays unchanged.</p>
    </div>}
    <LessonContent lesson={lesson} />
    {saveError && <p role="alert" className="course-alert">{saveError}</p>}
    <div className="course-actions"><button className="course-button" disabled={read || busy} onClick={markRead}>{read ? '✓ Marked as read' : busy ? 'Saving…' : 'Mark as read'}</button><Link className="course-button primary" to={courseHref(chapterId, 'test')}>Open chapter practice →</Link></div>
    <p className="course-muted">{lesson.questionCount} fixed questions · no time limit · explanations after submission.</p>
    {lesson.adaptiveAvailable && <Link className="course-button" to={courseHref(chapterId, 'practice')}>Review concepts &amp; focused practice →</Link>}
  </article></LearningReveal>;
}

function TestLoader({ course, testId, reloadCourse, backTo }: { course: Course; testId: string; reloadCourse: () => void; backTo: To }) {
  if (testId === 'final' && !course.progress.finalUnlocked) return <section>
    <h1>Final test is locked</h1><p>Submit every chapter test. No minimum score required.</p>
    <ul>{course.chapters.filter((c) => !testScores(course.progress.history, c.id).latest).map((c) => <li key={c.id}><Link to={courseHref(c.id, 'test')}>{c.title} · test pending</Link></li>)}</ul>
    <button className="course-button" onClick={reloadCourse}>Refresh eligibility</button>
  </section>;
  return <TestResource courseId={course.id} testId={testId} reloadCourse={reloadCourse} backTo={backTo} />;
}

function TestResource({ courseId, testId, reloadCourse, backTo, adaptive = false }: { courseId: string; testId: string; reloadCourse: () => void; backTo: To; adaptive?: boolean }) {
  const { data, error, reload } = useLearningResource<Test>('/courses/' + courseId + (adaptive ? '/chapters/' + testId + '/practice' : '/tests/' + testId));
  return data ? <TestView key={data.attempt?.id ?? 'new'} initial={data} courseId={courseId} onSubmitted={reloadCourse} backTo={backTo} reload={reload} />
    : <><Link className="course-text-button" to={backTo}>← Back to course</Link><LoadingState error={error} retry={reload} /></>;
}

function TestView({ initial, courseId, onSubmitted, backTo, reload }: { initial: Test; courseId: string; onSubmitted: () => void; backTo: To; reload: () => void }) {
  const [attempt, setAttempt] = useState(initial.attempt);
  const [answers, setAnswers] = useState(initial.attempt?.answers ?? {});
  const [pending, setPending] = useState<'start' | 'draft' | 'submit' | null>(null);
  const busy = pending !== null;
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
  const blocker = useBlocker(({ currentLocation, nextLocation }) => dirty
    && (currentLocation.pathname !== nextLocation.pathname || currentLocation.search !== nextLocation.search));
  useEffect(() => {
    if (blocker.state !== 'blocked') return;
    if (window.confirm('Leave without saving? Answers changed since your last draft will be lost.')) blocker.proceed();
    else blocker.reset();
  }, [blocker]);
  async function start() {
    setPending('start'); setError(''); setSaved('');
    try {
      const { data } = await api.post<Attempt>('/learning/courses/' + courseId + (adaptive ? '/chapters/' + initial.testId + '/practice' : '/tests/' + initial.testId + '/attempts'));
      setAttempt(data); setAnswers(data.answers);
    } catch (err) { setError(extractApiError(err)); }
    finally { setPending(null); }
  }
  async function save(submit: boolean) {
    if (!attempt) return;
    setPending(submit ? 'submit' : 'draft'); setError(''); setSaved('');
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
    finally { setPending(null); }
  }
  const scores = testScores(history, initial.testId);
  const answering = !!attempt && !attempt.submittedAt;
  const errorAlert = error && <div className="course-alert" role="alert">{error}<button className="course-text-button" onClick={reload}>Reload saved test</button></div>;
  return <section>
    <Link className="course-text-button" to={backTo}>← {initial.testId === 'final' ? 'Course overview' : 'Study material'}</Link>
    <p className="course-eyebrow">{adaptive ? 'Practice selected from your recent answers' : initial.testId === 'final' ? 'One question from every chapter' : 'Chapter practice'}</p><h1>{initial.title}</h1>
    <p>{attempt?.questions.length ?? initial.questionCount} {adaptive && !attempt ? 'questions requested' : 'questions'} · 1 point each · no negative marking · no time limit</p>
    {scores.latest && !adaptive && <p>Latest {percent(scores.latest.percent)} · Best {percent(scores.best ?? 0)}</p>}
    {adaptive && <p>Focused practice does not count as a chapter test or unlock the final. Difficulty stays within your saved education level.</p>}
    {adaptive && attempt?.selection && <div className="course-panel"><p>Focus: {attempt.selection.focusConcepts.join(', ')}</p><p>{Object.entries(attempt.selection.difficultyMix).map(([level, count]) => `${count} ${level}`).join(' · ')}</p><p>{attempt.selection.mode === 'revision' ? 'Revision set: these questions have been seen before and will not add fresh evidence.' : `${attempt.selection.freshCount} fresh questions. Previously seen questions are excluded.`}</p>{attempt.questions.length < 5 && <p>Shorter set: {attempt.questions.length} suitable questions available for this set.</p>}</div>}
    {!answering && errorAlert}
    {saved && <p className="course-save-status" role="status">✓ {saved}</p>}

    {!attempt ? <button className="course-button primary" disabled={busy} onClick={start}>{pending === 'start' ? 'Starting…' : adaptive ? 'Start focused practice' : 'Start test'}</button>
      : attempt.submittedAt ? <>
        <div className="course-result" role="status"><strong>{attempt.correct} / {attempt.total} · {percent(attempt.percent ?? 0)}</strong><h2>{(attempt.percent ?? 0) >= 80 ? 'A strong start' : 'Keep building your understanding'}</h2><p>{adaptive ? 'Use the concept feedback to choose what to revise next.' : recommendation(attempt.percent ?? 0)}</p><p>This short test is a practice signal, not a complete measure of mastery.</p></div>
        <button className="course-button primary" disabled={busy} onClick={start}>{pending === 'start' ? 'Starting…' : adaptive ? 'Continue focused practice' : 'Retry same questions'}</button>
        <p className="course-muted">{adaptive ? 'The next set adapts to fresh evidence. Sets at different difficulties are not directly comparable.' : 'Retakes use the same fixed questions.'} All attempts are kept until you reset course results.</p>
        {initial.adaptiveAvailable && <Link className="course-button" to={courseHref(initial.testId, 'practice')}>Review weak concepts &amp; practise →</Link>}
        {attempt.questions.map((q, i) => <article className="course-panel" key={q.id}><p className="course-eyebrow">{q.concept} · {attempt.answers[q.id] === q.answer ? 'Correct' : 'Review this concept'}</p><h2>{i + 1}. {q.prompt}</h2><p>Your answer: {attempt.answers[q.id] === undefined ? 'Not answered' : q.options[attempt.answers[q.id]]}</p>{q.answer !== undefined && <p><strong>Correct answer: {q.options[q.answer]}</strong></p>}<p>{q.explanation}</p></article>)}
      </> : <form onSubmit={(e) => { e.preventDefault(); void save(true); }}>
        <p className="course-muted">Save your draft before leaving to resume on any device. Submission saves all answers.</p>
        {attempt.questions.map((q, i) => <fieldset className="course-question" key={q.id} disabled={busy}><legend>{i + 1}. {q.prompt}</legend><p className="course-eyebrow">{q.concept} · {q.difficulty}</p>
          {q.options.map((option, index) => <label className={'course-option ' + (answers[q.id] === index ? 'selected' : '')} key={option}><input type="radio" name={q.id} value={index} checked={answers[q.id] === index} onChange={() => { setAnswers({ ...answers, [q.id]: index }); setSaved(''); }} /><span>{String.fromCharCode(65 + index)}. {option}</span></label>)}
        </fieldset>)}
        {errorAlert}
        <div className="course-actions course-test-toolbar"><div><span>{Object.keys(answers).length} / {attempt.questions.length} answered</span><small>{dirty ? 'Unsaved changes' : 'Draft up to date'}</small></div><button className="course-button" type="button" disabled={busy} onClick={() => void save(false)}>{pending === 'draft' ? 'Saving draft…' : 'Save draft'}</button><button className="course-button primary" type="submit" disabled={busy}>{pending === 'submit' ? 'Submitting…' : 'Submit test'}</button></div>
      </form>}
    {insights && (!attempt || attempt.submittedAt) && <ConceptFeedback insights={insights} />}
    {history.length > 0 && <details className="course-panel"><summary>{adaptive ? 'Focused practice history' : 'Attempt history'} ({history.length})</summary><ol>{history.map((item) => <li key={item.id}>{dateFormat.format(new Date(item.submittedAt))} · {percent(item.percent)}{item.kind === 'adaptive' && item.selection && <> · {item.selection.focusConcepts.join(', ')} · {Object.entries(item.selection.difficultyMix).map(([level, count]) => `${count} ${level}`).join(', ')} · {item.selection.mode === 'revision' ? 'Repeated revision' : 'Fresh practice'}</>}</li>)}</ol></details>}
  </section>;
}
