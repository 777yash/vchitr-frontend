import { useRef, useState } from 'react';
import { Link, type To } from 'react-router-dom';
import type { Lesson, ReadingProgress } from '../learning/course';
import { useActiveTime } from '../learning/useActiveTime';
import LessonContent from './LessonContent';

export default function ReadingLesson({ lesson, courseId, testTo }: { lesson: Lesson; courseId: string; testTo: To }) {
  const root = useRef<HTMLDivElement>(null);
  const [dismissed, setDismissed] = useState(false);
  const initial = lesson.readingProgress;
  const tracking = useActiveTime<ReadingProgress>(root, initial ? '/learning/courses/' + courseId + '/chapters/' + lesson.id + '/progress' : null,
    courseId + ':' + lesson.id, initial?.sourceKey);
  const progress = tracking.data ?? initial;
  return <div ref={root}>
    {progress && <section className="course-panel" aria-label="Reading progress">
      <p>About {progress.estimatedMinutes} min reading · {progress.percent}% read</p>
      <progress value={progress.percent} max={100} aria-label="Chapter reading progress" />
      <p className="course-muted">Progress counts sections viewed for at least 3 active seconds. Hidden or idle tabs do not count. Saves periodically.</p>
      {!lesson.contentVariant?.generated && <nav aria-label="Lesson sections">{progress.sections.map(section => <p key={section.id}><a href={'#reading-' + section.id}>{section.title}</a></p>)}</nav>}
    </section>}
    {tracking.error && <p className="course-alert" role="status">Reading progress could not save: {tracking.error} Temporary failures retry automatically; reload if the lesson changed.</p>}
    <LessonContent lesson={lesson} />
    {progress?.testReady && !dismissed && <section className="course-panel" aria-label="Quick check">
      <h2>Ready for a quick check?</h2><p>You’ve read at least {progress.threshold}% of this lesson.</p>
      <div className="course-actions"><Link className="course-button primary" to={testTo}>Open chapter practice →</Link>
        <button className="course-button" onClick={() => setDismissed(true)}>Keep reading</button></div>
    </section>}
  </div>;
}
