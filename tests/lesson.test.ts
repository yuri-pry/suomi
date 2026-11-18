import { expect, test } from 'vitest';
import { answer, drawCheckpoint, fractionDone, isDone, retryPosition, shuffle, startLesson } from '../src/lib/lesson';
import type { Exercise, Unit } from '../src/lib/types';

const ex = (id: string): Exercise => ({
  id,
  type: 'fill',
  prompt: '___',
  promptLang: 'fi',
  answerLang: 'fi',
  answers: ['on'],
});

test('missed exercises come back once after the last new one, in the order missed', () => {
  let s = startLesson([ex('a'), ex('b'), ex('c'), ex('d')]);
  s = answer(s, false); // a
  s = answer(s, true); // b
  s = answer(s, false); // c
  s = answer(s, true); // d: retry round starts
  expect(s.queue.map((e) => e.id)).toEqual(['a', 'c']);
  expect(s.retries).toBe(2);
  expect(retryPosition(s)).toBe(1);
  s = answer(s, true); // a right
  expect(retryPosition(s)).toBe(2);
  s = answer(s, false); // c wrong again: not asked a third time
  expect(isDone(s)).toBe(true);
  expect(s.wrong).toEqual(['a', 'c']);
  expect(s.total).toBe(4);
  expect(s.done).toBe(6);
});

test('a lesson with no mistakes has no retry round', () => {
  let s = startLesson([ex('a'), ex('b')]);
  s = answer(s, true);
  s = answer(s, true);
  expect(isDone(s)).toBe(true);
  expect(s.retries).toBe(0);
  expect(s.wrong).toEqual([]);
});

test('progress moves on a wrong answer and grows by the retry round', () => {
  let s = startLesson([ex('a'), ex('b')]);
  s = answer(s, false);
  expect(fractionDone(s)).toBe(0.5);
  s = answer(s, true); // retry round of 1 begins
  expect(fractionDone(s)).toBe(2 / 3);
  s = answer(s, true);
  expect(fractionDone(s)).toBe(1);
});

test('shuffle keeps every item', () => {
  expect(shuffle([1, 2, 3, 4], () => 0).sort()).toEqual([1, 2, 3, 4]);
});

const unit = (n: number, prefix: string): Unit => ({
  id: prefix,
  section: 1,
  title: prefix,
  tip: { en: '' },
  lessons: [1, 2, 3, 4, 5].map((l) => ({
    id: `${prefix}-l${l}`,
    title: '',
    exercises: Array.from({ length: n }, (_, i) => (i === 0 ? { ...ex(`${prefix}-${l}-${i}`), type: 'listen' as const } : ex(`${prefix}-${l}-${i}`))) as Exercise[],
  })),
});

test('a checkpoint draws 15 distinct exercises from its own unit, skipping listening without a voice', () => {
  const u = unit(6, 'u01');
  const drawn = drawCheckpoint(u, false, () => 0.3);
  expect(drawn).toHaveLength(15);
  expect(new Set(drawn.map((e) => e.id)).size).toBe(15);
  expect(drawn.every((e) => e.id.startsWith('u01-') && e.type !== 'listen')).toBe(true);
  expect(drawCheckpoint(u, true, () => 0.3).some((e) => e.type === 'listen')).toBe(true);
});

test('a unit with fewer than 15 playable exercises uses them all', () => {
  expect(drawCheckpoint(unit(2, 'u02'), false)).toHaveLength(5);
  expect(drawCheckpoint(unit(2, 'u02'), true)).toHaveLength(10);
});
