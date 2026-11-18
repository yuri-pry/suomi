import { expect, test } from 'vitest';
import { almostDiff, almostOf, checkTyped, normalize } from '../src/lib/check';

test('normalize trims, lowercases, collapses spaces and drops final punctuation', () => {
  expect(normalize('  Hyvää   Päivää! ')).toBe('hyvää päivää');
});

test('Finnish answers must match exactly', () => {
  expect(checkTyped('Omenaa.', ['omenaa'], 'fi')).toBe('right');
  expect(checkTyped('omenaa', ['omenan', 'omenaa'], 'fi')).toBe('right');
  // one letter off may be a different case: 'almost', never accepted
  expect(checkTyped('omena', ['omenaa'], 'fi')).toBe('almost');
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

test('almost: a/ä and o/ö in one place, one missing or one extra letter', () => {
  expect(almostDiff('paiva', 'päivä')).toBeNull(); // two swaps
  expect(almostDiff('päivaä', 'päivää')).toEqual({ kind: 'swap', at: 4 });
  expect(almostDiff('päivä', 'päivää')).toEqual({ kind: 'missing', at: 5 });
  expect(almostDiff('talooon', 'taloon')).toEqual({ kind: 'extra', at: 5 });
  expect(almostDiff('kayn', 'käyn')).toEqual({ kind: 'swap', at: 1 });
  expect(almostDiff('hyvaa', 'hyvää')).toBeNull();
  expect(almostDiff('hyvää', 'hyvää')).toBeNull();
  expect(almostDiff('kay', 'käy')).toBeNull(); // 3 letters
  expect(almostDiff('pöytä', 'poytä')).toEqual({ kind: 'swap', at: 1 });
  expect(almostDiff('poyta', 'pöytä')).toBeNull();
  expect(almostDiff('omena', 'omenaa')).toEqual({ kind: 'missing', at: 5 });
  expect(almostDiff('okmenaa', 'omenaa')).toEqual({ kind: 'extra', at: 1 });
});

test('almost: Finnish verdicts', () => {
  expect(checkTyped('kayn', ['käyn'], 'fi')).toBe('almost');
  expect(checkTyped('Omenaaa.', ['omenaa'], 'fi')).toBe('almost');
  expect(checkTyped('omenaa', ['omenan', 'omenaa'], 'fi')).toBe('right');
  // two errors
  expect(checkTyped('omna', ['omenaa'], 'fi')).toBe('wrong');
  expect(checkTyped('paivaa', ['päivää'], 'fi')).toBe('wrong');
  // short answers stay exact
  expect(checkTyped('tlo', ['talo'], 'fi')).toBe('almost');
  expect(checkTyped('ol', ['olen'], 'fi')).toBe('wrong');
  expect(checkTyped('on', ['ön'], 'fi')).toBe('wrong');
  expect(checkTyped('mä', ['ma'], 'fi')).toBe('wrong');
  expect(almostOf('kayn', ['käyn'])).toEqual({ kind: 'swap', at: 1, given: 'kayn' });
});

test('almost: English path unchanged', () => {
  expect(checkTyped('techer', ['teacher'], 'en')).toBe('typo');
  expect(checkTyped('tea', ['tee'], 'en')).toBe('wrong');
});
