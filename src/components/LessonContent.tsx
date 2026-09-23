import type { Lesson } from '../learning/course';

export default function LessonContent({ lesson }: { lesson: Lesson }) {
  const variant = lesson.contentVariant;
  const generated = variant?.status === 'ready' ? variant.generated : null;
  if (!generated) return <>
    {variant?.status === 'unavailable' && <p role="status" className="course-alert">The {variant.requestedTier === 'beginner' ? 'Beginner' : 'Advanced'} explanation is not available yet. Showing the original lesson.</p>}
    <section className="course-panel"><h2>Core concepts</h2>{lesson.concepts.map((text) => <p key={text}>{text}</p>)}</section>
    <section className="course-panel worked-example"><p className="course-eyebrow">Worked example</p><h2>{lesson.example.problem}</h2><ol>{lesson.example.steps.map((text) => <li key={text}>{text}</li>)}</ol></section>
    <section className="course-panel"><h2>Watch for this</h2><p>{lesson.watchFor}</p></section>
  </>;
  const words = [generated.summary, ...generated.sections.flatMap((s) => [s.title, ...s.explanation, s.example.problem, ...s.example.steps, s.checkYourself]), ...generated.takeaways].join(' ').split(/\s+/).length;
  return <>
    <p className="course-muted">AI-adapted explanation · {variant?.verified ? 'Reviewed' : 'Not yet teacher-reviewed'} · About {Math.max(1, Math.ceil(words / 160))} min reading</p>
    <p className="course-lead">{generated.summary}</p>
    <nav className="course-panel" aria-label="Lesson sections"><h2>In this lesson</h2><ol>{generated.sections.map((section, index) => <li key={index}><a href={'#lesson-section-' + index}>{section.title}</a></li>)}</ol></nav>
    {generated.sections.map((section, index) => <section className="course-panel" id={'lesson-section-' + index} key={index}>
      <h2>{section.title}</h2>{section.explanation.map((paragraph, i) => <p key={i}>{paragraph}</p>)}
      <h3>Worked example</h3><p>{section.example.problem}</p><ol>{section.example.steps.map((step, i) => <li key={i}>{step}</li>)}</ol>
      <h3>Check yourself</h3><p>{section.checkYourself}</p>
    </section>)}
    <section className="course-panel"><h2>Key takeaways</h2><ul>{generated.takeaways.map((text, i) => <li key={i}>{text}</li>)}</ul></section>
  </>;
}
