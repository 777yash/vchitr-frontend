import type { AttemptSummary } from './course.ts';

export function testScores(history: AttemptSummary[], testId: string) {
  const attempts = history.filter((attempt) => attempt.testId === testId);
  return { latest: attempts.at(-1), best: attempts.length ? Math.max(...attempts.map((a) => a.percent)) : null };
}
export function recommendation(percent: number) {
  if (percent < 60) return 'Revisit the core concepts and worked example, then retry.';
  if (percent < 80) return 'Review the missed concepts, then try the questions again.';
  return 'Good result on this short practice. Move on, or explain your method without the options.';
}
