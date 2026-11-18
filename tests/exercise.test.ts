import { expect, test } from 'vitest';
import { correctText, dropIndex, emptyResponse, grade, isMatched, moveTile, pick, tilesFor } from '../src/lib/exercise';
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
  expect(grade(tr('fi', ['Näkemiin']), 'Nakemiin')).toBe('almost');
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

test('moveTile reorders within the row and inserts from the bank', () => {
  expect(moveTile([0, 1, 2], 0, 2)).toEqual([1, 2, 0]);
  expect(moveTile([0, 1, 2], 2, 0)).toEqual([2, 0, 1]);
  expect(moveTile([0, 1, 2], 1, 1)).toEqual([0, 1, 2]);
  // from the bank
  expect(moveTile([0, 1], 5, 1)).toEqual([0, 5, 1]);
  expect(moveTile([], 5, 3)).toEqual([5]);
  expect(moveTile([0, 1], 5, -4)).toEqual([5, 0, 1]);
});

test('dropIndex finds the slot on a wrapping row', () => {
  // two chips on the first line, one on the second
  const chips = [
    { left: 0, right: 100, top: 0, bottom: 50 },
    { left: 110, right: 210, top: 0, bottom: 50 },
    { left: 0, right: 100, top: 60, bottom: 110 },
  ];
  expect(dropIndex(chips, 10, 20)).toBe(0);
  expect(dropIndex(chips, 160, 20)).toBe(1);
  expect(dropIndex(chips, 300, 20)).toBe(2);
  expect(dropIndex(chips, 10, 80)).toBe(2);
  expect(dropIndex(chips, 90, 80)).toBe(3);
  expect(dropIndex([], 5, 5)).toBe(0);
});
