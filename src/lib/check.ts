import type { Lang } from './types';

/** 'almost' is a Finnish answer one letter off: the learner may fix it once. */
export type Verdict = 'right' | 'typo' | 'almost' | 'wrong';

export const normalize = (s: string) =>
  s.trim().toLowerCase().replace(/\s+/g, ' ').replace(/[.!?,;:]+$/, '').trim();

/** True when a and b differ by at most one inserted, deleted or replaced letter. */
function withinOneEdit(a: string, b: string) {
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  if (a.length === b.length) return a.slice(i + 1) === b.slice(i + 1);
  const [long, short] = a.length > b.length ? [a, b] : [b, a];
  return long.slice(i + 1) === short.slice(i);
}

export type Almost = { kind: 'swap' | 'missing' | 'extra'; /** Index in the given text: the letter that differs, or where one is missing. */ at: number };

const SWAPS = ['aä', 'oö'];

/** How `given` is one step from `accepted`: a/ä or o/ö swapped in one place, one letter missing, or one extra. null otherwise. */
export function almostDiff(given: string, accepted: string): Almost | null {
  if (accepted.length <= 3 || given === accepted) return null;
  if (given.length === accepted.length) {
    const at = [...given].findIndex((c, i) => c !== accepted[i]);
    const pair = given[at] + accepted[at];
    const ok = SWAPS.some((s) => pair === s || pair === s[1] + s[0]) && given.slice(at + 1) === accepted.slice(at + 1);
    return ok ? { kind: 'swap', at } : null;
  }
  if (Math.abs(given.length - accepted.length) !== 1) return null;
  const missing = given.length < accepted.length;
  const [long, short] = missing ? [accepted, given] : [given, accepted];
  let at = 0;
  while (at < short.length && long[at] === short[at]) at++;
  return long.slice(at + 1) === short.slice(at) ? { kind: missing ? 'missing' : 'extra', at } : null;
}

/** The first accepted answer the typed text is almost, with how it differs. */
export function almostOf(input: string, answers: string[]): (Almost & { given: string }) | null {
  const given = normalize(input);
  for (const a of answers) {
    const d = almostDiff(given, normalize(a));
    if (d) return { ...d, given };
  }
  return null;
}

/** Which words the learner got wrong: `true` = this word is wrong, indexed by word position in the given text. */
export function diffWords(input: string, answers: string[]): boolean[] {
  const givenWords = normalize(input).split(' ');
  // Pick the accepted answer with the most words in common.
  let bestWrong = givenWords.map(() => true);
  let bestCount = -1;
  for (const a of answers) {
    const target = normalize(a).split(' ');
    const wrong = givenWords.map((w, i) => w !== target[i]);
    const right = wrong.filter((w) => !w).length;
    if (right > bestCount) { bestCount = right; bestWrong = wrong; }
  }
  return bestWrong;
}

/**
 * Finnish must match exactly, but a/ä, o/ö, one missing or one extra letter is 'almost'
 * (answers of 3 letters or fewer never are). English accepts one wrong letter as a typo.
 */
export function checkTyped(input: string, answers: string[], lang: Lang): Verdict {
  const given = normalize(input);
  if (!given) return 'wrong';
  const accepted = answers.map(normalize);
  if (accepted.includes(given)) return 'right';
  if (lang === 'en' && accepted.some((a) => a.length > 3 && withinOneEdit(given, a))) return 'typo';
  if (lang === 'fi' && almostOf(input, answers)) return 'almost';
  return 'wrong';
}
