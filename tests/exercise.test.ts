import { expect, test } from 'vitest';
import { correctText, emptyResponse, grade, isMatched, pick, tilesFor } from '../src/lib/exercise';
import type { Exercise, Match, Order } from '../src/lib/types';

const base = { id: 'x', promptLang: 'en', answerLang: 'fi', prompt: 'p' } as const;
const order: Order = { ...base, type: 'order', answers: ['Minä olen Anna.', 'Olen Anna.'], tiles: ['on'] };
const match: Match = {
  ...base,
  type: 'match',
  promptLang: 'fi',
  answerLang: 'en',
  prompt: '',
  pairs: [
    { fi: 'yksi', en: 'one' },
    { fi: 'kaksi', en: 'two' },
  ],
};

test('order: tiles are the words of the first answer plus distractors', () => {
  expect(tilesFor(order)).toEqual(['Minä', 'olen', 'Anna.', 'on']);
});

test('order: any accepted sentence is right, wrong order is wrong, empty is unanswered', () => {
  expect(grade(order, ['olen', 'Anna.'])).toBe('right');
  expect(grade(order, ['Minä', 'olen', 'Anna.'])).toBe('right');
  expect(grade(order, ['Anna.', 'olen'])).toBe('wrong');
  expect(grade(order, [])).toBeNull();
});

test('translate: Finnish is exact, English allows a typo', () => {
  const tr = (answerLang: 'fi' | 'en', answers: string[]): Exercise => ({ ...base, type: 'translate', answerLang, answers });
  expect(grade(tr('fi', ['Kiitos.']), 'kiitos')).toBe('right');
  expect(grade(tr('fi', ['Näkemiin']), 'Nakemiin')).toBe('wrong');
  expect(grade(tr('en', ['Good morning']), 'Good mornig')).toBe('typo');
  expect(grade(tr('en', ['Good morning']), '  ')).toBeNull();
});

test('truefalse: compares with the boolean answer, false is an answer', () => {
  const tf: Exercise = { ...base, type: 'truefalse', text: 't', answer: false };
  expect(grade(tf, false)).toBe('right');
  expect(grade(tf, true)).toBe('wrong');
  expect(grade(tf, null)).toBeNull();
});

test('match: one wrong pair makes the exercise wrong; it is graded only when complete', () => {
  let s = { done: [] as number[], mistakes: 0 };
  s = pick(s, 0, 1);
  expect(s).toEqual({ done: [], mistakes: 1 });
  s = pick(pick(s, 0, 0), 1, 1);
  expect(isMatched(s, match)).toBe(true);
  expect(grade(match, s.mistakes)).toBe('wrong');
  expect(grade(match, 0)).toBe('right');
  expect(grade(match, null)).toBeNull();
});

test('empty responses and correct text', () => {
  expect(emptyResponse(order)).toEqual([]);
  expect(emptyResponse(match)).toBeNull();
  expect(correctText(match)).toBe('yksi = one; kaksi = two');
  expect(correctText(order)).toBe('Minä olen Anna.');
});
