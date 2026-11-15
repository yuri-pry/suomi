import type { Choice, Fill } from './types';

export type PlacementItem = (Choice | Fill) & { unit: string };

export const BLOCK_SIZE = 3;
const PASS = 2;

/**
 * Binary search for the first unit the learner fails (SPEC section 6). Units are
 * indices into the list of tested units. `lo` is the lowest unit that may still be
 * the start; `hi` equal to the number of units means "passed everything".
 */
export type Search = { lo: number; hi: number };

export const startSearch = (unitCount: number): Search => ({ lo: 0, hi: unitCount });

/** The unit to test next, or null when the search is over. */
export const nextUnit = (s: Search) => (s.lo < s.hi ? Math.floor((s.lo + s.hi) / 2) : null);

export function afterBlock(s: Search, passed: boolean): Search {
  const mid = nextUnit(s);
  if (mid === null) return s;
  return passed ? { ...s, lo: mid + 1 } : { ...s, hi: mid };
}

export const passes = (correct: number) => correct >= PASS;

/** The unit to start at once the search is over. A learner who passed everything starts at the last unit. */
export const startIndex = (s: Search, unitCount: number) => Math.min(s.lo, unitCount - 1);

/** The most blocks a test over `unitCount` units can take. */
export const maxBlocks = (unitCount: number) => Math.ceil(Math.log2(unitCount + 1));

/** Unit ids that have a full block of items, in order. Only these can be tested. */
export function testableUnits(items: PlacementItem[]): string[] {
  const count = new Map<string, number>();
  for (const item of items) count.set(item.unit, (count.get(item.unit) ?? 0) + 1);
  return [...count].filter(([, n]) => n >= BLOCK_SIZE).map(([unit]) => unit).sort();
}

export const blockFor = (items: PlacementItem[], unit: string) => items.filter((i) => i.unit === unit).slice(0, BLOCK_SIZE);
