import type { Insights } from '../learning/course';

export default function ConceptFeedback({ insights }: { insights: Insights }) {
  return <section className="concept-feedback" aria-label="Concept feedback">
    <h2>Your next steps</h2>
    <p>Based on first submitted answers to fresh questions. Repeating a question does not add fresh evidence. These are practice signals, not a measure of mastery.</p>
    <div className="concept-grid">{insights.concepts.map((concept) => <article className="course-panel" key={concept.id}>
      <p className="course-eyebrow">{concept.priority === 0 ? 'Revise next' : concept.status === 'positive' ? 'Positive signals' : concept.evidenceCount === 0 ? 'Not assessed yet' : 'Keep practising'}</p>
      <h3>{concept.title}</h3>
      <p>{concept.evidenceCount ? `${concept.correct} of ${concept.evidenceCount} recent fresh answers correct.` : 'Start practice to build evidence.'} {concept.evidenceCount < 3 && 'More evidence needed.'}</p>
      <p className="course-muted">Next practice: {concept.nextDifficulty}</p>
      <details><summary>Review {concept.title}</summary>
        <p>{concept.explanation}</p>
        <h4>{concept.example.problem}</h4><ol>{concept.example.steps.map(step => <li key={step}>{step}</li>)}</ol>
        <p><strong>Common mistake: </strong>{concept.commonMistake}</p>
        <ul>{concept.checklist.map(step => <li key={step}>{step}</li>)}</ul>
      </details>
    </article>)}</div>
  </section>;
}
