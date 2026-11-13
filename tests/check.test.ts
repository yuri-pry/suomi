import { expect, test } from 'vitest';
import { checkTyped, normalize } from '../src/lib/check';

test('normalize trims, lowercases, collapses spaces and drops final punctuation', () => {
  expect(normalize('  Hyvää   Päivää! ')).toBe('hyvää päivää');
});

test('Finnish answers must match exactly', () => {
  expect(checkTyped('Omenaa.', ['omenaa'], 'fi')).toBe('right');
  expect(checkTyped('omenaa', ['omenan', 'omenaa'], 'fi')).toBe('right');
  // one letter off is a different case, so no typo tolerance
  expect(checkTyped('omena', ['omenaa'], 'fi')).toBe('wrong');
  expect(checkTyped('omenan', ['omenaa'], 'fi')).toBe('wrong');
  // ä is never treated as a
  expect(checkTyped('paivaa', ['päivää'], 'fi')).toBe('wrong');
});

test('English answers accept one wrong letter as a typo', () => {
  expect(checkTyped('teacher', ['teacher'], 'en')).toBe('right');
  expect(checkTyped('techer', ['teacher'], 'en')).toBe('typo');
  expect(checkTyped('teachxr', ['teacher'], 'en')).toBe('typo');
  expect(checkTyped('teachers', ['teacher'], 'en')).toBe('typo');
  expect(checkTyped('tchr', ['teacher'], 'en')).toBe('wrong');
  // short words get no tolerance: "he" and "we" are different answers
  expect(checkTyped('he', ['we'], 'en')).toBe('wrong');
});

test('an empty answer is wrong', () => {
  expect(checkTyped('   ', ['on'], 'fi')).toBe('wrong');
});
