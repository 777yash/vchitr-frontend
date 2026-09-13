import test from 'node:test';
import assert from 'node:assert/strict';
import { testScores, recommendation } from '../src/learning/progress.ts';

test('latest and best remain separate when a retake scores lower', () => {
  const history = [{ id: 'a', testId: 'ch-01', percent: 100 }, { id: 'b', testId: 'ch-02', percent: 80 }, { id: 'c', testId: 'ch-01', percent: 40 }];
  assert.equal(testScores(history, 'ch-01').latest.id, 'c');
  assert.equal(testScores(history, 'ch-01').best, 100);
  assert.equal(testScores(history, 'ch-02').best, 80);
  assert.deepEqual(testScores([], 'ch-01'), { latest: undefined, best: null });
});

test('practice recommendations change at the agreed score boundaries', () => {
  assert.match(recommendation(59), /Revisit/);
  assert.match(recommendation(60), /Review/);
  assert.match(recommendation(79), /Review/);
  assert.match(recommendation(80), /Good result/);
});
