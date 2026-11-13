import type { Lang } from './types';

export type Verdict = 'right' | 'typo' | 'wrong';

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

/**
 * Finnish must match exactly: one letter is often a different case or word (a/ä, missing -n).
 * English accepts one wrong letter as a typo.
 */
export function checkTyped(input: string, answers: string[], lang: Lang): Verdict {
  const given = normalize(input);
  if (!given) return 'wrong';
  const accepted = answers.map(normalize);
  if (accepted.includes(given)) return 'right';
  if (lang === 'en' && accepted.some((a) => a.length > 3 && withinOneEdit(given, a))) return 'typo';
  return 'wrong';
}
