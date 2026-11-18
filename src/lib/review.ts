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

/** The review session: the due items first, then exercises for the weakest rules up to REVIEW_CAP. */
export function reviewSession(units: Unit[], rules: Rule[], p: Progress, today: string, canSpeak: boolean) {
  // Listening items wait in the deck on a device with no Finnish voice.
  const due = playable(dueExercises(units, p.review, today), canSpeak);
  const weak = playable(weakExercises(units, rules, p, new Set(due.map((e) => e.id))), canSpeak).slice(0, REVIEW_CAP - due.length);
  return { due, weak, session: [...due, ...weak] };
}

/** Saves the outcome of a review session. A wrong answer on a weak-rule exercise joins the deck like any other mistake. */
export function finishReview(p: Progress, s: ReturnType<typeof reviewSession>, wrongIds: string[], units: Unit[], rules: Rule[], today: string): Progress {
  const reviewedDeck = completeReview(p, s.due.map((e) => e.id), wrongIds, today);
  const weakWrong = wrongIds.filter((id) => s.weak.some((e) => e.id === id));
  return scoreAnswers({ ...reviewedDeck, review: addMistakes(reviewedDeck.review, weakWrong, today) }, rules, s.session, wrongIds, units, true);
}
