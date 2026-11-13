import { expect, test } from 'vitest';
import { answer, fractionDone, isDone, shuffle, startLesson } from '../src/lib/lesson';
import type { Exercise } from '../src/lib/types';

const ex = (id: string): Exercise => ({
  id,
  type: 'fill',
  prompt: '___',
  promptLang: 'fi',
  answerLang: 'fi',
  answers: ['on'],
});

test('a wrong answer returns at the end and the lesson ends only when all are right', () => {
  let s = startLesson([ex('a'), ex('b'), ex('c')]);
  s = answer(s, false); // a wrong
  expect(s.queue.map((e) => e.id)).toEqual(['b', 'c', 'a']);
  s = answer(s, true); // b
  s = answer(s, true); // c
  expect(isDone(s)).toBe(false);
  s = answer(s, false); // a wrong again: counted once
  expect(s.wrong).toEqual(['a']);
  s = answer(s, true);
  expect(isDone(s)).toBe(true);
  expect(s.total).toBe(3);
});

test('progress fraction follows finished exercises, not attempts', () => {
  let s = startLesson([ex('a'), ex('b')]);
  s = answer(s, false);
  expect(fractionDone(s)).toBe(0);
  s = answer(s, true);
  expect(fractionDone(s)).toBe(0.5);
});

test('shuffle keeps every item', () => {
  expect(shuffle([1, 2, 3, 4], () => 0).sort()).toEqual([1, 2, 3, 4]);
});
