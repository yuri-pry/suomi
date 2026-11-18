import { XP_REVIEW, earn, localDay, type Progress } from './progress';
import { scoreAnswers, weakExercises } from './mastery';
import { playable } from './lesson';
import type { Exercise, Rule, Unit } from './types';

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

/** The due exercises, looked up by id across all units. An id whose exercise no longer exists is skipped. */
export function dueExercises(units: Unit[], deck: Deck, today: string): Exercise[] {
  const byId = new Map(units.flatMap((u) => u.lessons.flatMap((l) => l.exercises)).map((e) => [e.id, e]));
  return dueItems(deck, today).flatMap((id) => byId.get(id) ?? []);
}

/** A finished review session: every played item moves by its first answer, and the session earns XP_REVIEW. */
export function completeReview(p: Progress, playedIds: string[], wrongIds: string[], today: string): Progress {
  let deck = p.review;
  for (const id of playedIds) deck = reviewed(deck, id, !wrongIds.includes(id), today);
  return { ...earn(p, XP_REVIEW, today), review: deck };
}

/** The review session: only the spaced-repetition deck, the due items. */
export function reviewSession(units: Unit[], p: Progress, today: string, canSpeak: boolean) {
  // Listening items wait in the deck on a device with no Finnish voice.
  return playable(dueExercises(units, p.review, today), canSpeak);
}

/** Saves a review session: the deck moves by first answers and the rules are scored per exercise, like a lesson. */
export function finishReview(p: Progress, session: Exercise[], wrongIds: string[], units: Unit[], rules: Rule[], today: string): Progress {
  const next = completeReview(p, session.map((e) => e.id), wrongIds, today);
  return scoreAnswers(next, rules, session, wrongIds, units);
}

export const PRACTICE_SIZE = 10;
export const PRACTICE_PER_RULE = 3;

/** Practice: a few exercises for each of the weakest unmastered rules, apart from the deck's due items. */
export function practiceSession(units: Unit[], rules: Rule[], p: Progress, today: string, canSpeak: boolean) {
  const due = new Set(dueExercises(units, p.review, today).map((e) => e.id));
  return playable(weakExercises(units, rules, p, due, PRACTICE_PER_RULE), canSpeak).slice(0, PRACTICE_SIZE);
}

/** Saves a practice session: it earns the review XP, scores per exercise, and a miss joins the deck. */
export function finishPractice(p: Progress, session: Exercise[], wrongIds: string[], units: Unit[], rules: Rule[], today: string): Progress {
  const next = { ...earn(p, XP_REVIEW, today), review: addMistakes(p.review, wrongIds, today) };
  return scoreAnswers(next, rules, session, wrongIds, units);
}
