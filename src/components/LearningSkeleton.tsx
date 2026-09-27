export default function LearningSkeleton() {
  return <div className="learning-skeleton" role="status" aria-label="Loading your learning material" aria-busy="true">
    <span className="learning-sr-only">Loading your learning material…</span>
    <div aria-hidden="true"><i /><i /><div className="learning-skeleton-panel"><i /><i /><i /></div></div>
  </div>;
}
