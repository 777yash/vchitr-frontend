import test from 'node:test';
import assert from 'node:assert/strict';
import { createSessionCache } from '../src/api/sessionCache.ts';

test('guard and navigation share validation; cached verification expires', async () => {
  let calls = 0, time = 0;
  const cache = createSessionCache(() => 'a', async () => { calls++; return { id: 1 }; }, 60, () => time);
  const first = cache.get();
  assert.equal(cache.get(), first);
  await first;
  await cache.get();
  assert.equal(calls, 1);
  assert.equal(cache.peek().id, 1);
  time = 60;
  assert.equal(cache.peek(), undefined);
  await cache.get();
  assert.equal(calls, 2);
});

test('logout invalidates an outstanding response even if the same token is restored', async () => {
  let token = 'a', resolve;
  const cache = createSessionCache(() => token, () => new Promise(r => { resolve = r; }));
  const request = cache.get();
  token = null; cache.sync();
  token = 'a'; cache.sync();
  resolve({ id: 1 });
  await assert.rejects(request, /Session changed/);
  assert.equal(cache.peek(), undefined);
});

test('failed validation can retry; switching accounts never reuses previous identity', async () => {
  let token = 'a', fail = true;
  const cache = createSessionCache(() => token, async t => {
    if (fail) throw new Error('Server unavailable');
    return { id: t };
  });
  await assert.rejects(cache.get(), /unavailable/);
  fail = false;
  assert.equal((await cache.get()).id, 'a');
  token = 'b';
  assert.equal(cache.peek(), undefined);
  assert.equal((await cache.get()).id, 'b');
  token = null;
  await assert.rejects(cache.get(), /sign in/);
});
