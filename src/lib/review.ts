import type { Progress } from './progress';
import { localDay } from './progress';

export type Deck = Progress['review'];

/** Days until the next review after a right answer in box 0, 1, 2, 3, 4. */
export const INTERVALS = [1, 3, 7, 14, 30];

export const REVIEW_CAP = 15;

export function addDays(day: string, n: number): string {
  const [y, m, d] = day.split('-').map(Number);
  return localDay(new Date(y, m - 1, d + n));
}

export function addMistakes(deck: Deck, ids: string[], today: string): Deck {
  const next: Deck = { ...deck };
  for (const id of ids) next[id] = { box: 0, due: today };
  return next;
}

export function dueItems(deck: Deck, today: string): string[] {
  return Object.entries(deck)
    .filter(([, v]) => v.due <= today)
    .sort((a, b) => a[1].due < b[1].due ? -1 : a[1].due > b[1].due ? 1 : a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0)
    .slice(0, REVIEW_CAP)
    .map(([id]) => id);
}

export function reviewed(deck: Deck, id: string, correct: boolean, today: string): Deck {
  if (!(id in deck)) return deck;
  const { box } = deck[id];
  if (correct) {
    if (box >= INTERVALS.length) {
      const next: Deck = { ...deck };
      delete next[id];
      return next;
    }
    return { ...deck, [id]: { box: box + 1, due: addDays(today, INTERVALS[box]) } };
  }
  return { ...deck, [id]: { box: 0, due: today } };
}
