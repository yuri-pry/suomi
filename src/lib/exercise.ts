import { checkTyped, type Verdict } from './check';
import type { Exercise, Match, Order } from './types';

/** What the learner has entered so far; the shape depends on the exercise type. */
export type Response = number | string | string[] | boolean | null;

export const emptyResponse = (e: Exercise): Response =>
  e.type === 'fill' || e.type === 'translate' ? '' : e.type === 'order' ? [] : null;

/** null while there is nothing to check yet. For `match` the response is the number of wrong pairs, once all are paired. */
export function grade(e: Exercise, r: Response): Verdict | null {
  switch (e.type) {
    case 'choice':
    case 'listen':
    case 'truefalse':
      return r === null ? null : r === e.answer ? 'right' : 'wrong';
    case 'fill':
    case 'translate':
      return typeof r === 'string' && r.trim() !== '' ? checkTyped(r, e.answers, e.answerLang) : null;
    case 'order':
      if (!Array.isArray(r) || r.length === 0) return null;
      // tiles cannot be edited, so a near miss is just wrong
      return ((v) => (v === 'almost' ? 'wrong' : v))(checkTyped(r.join(' '), e.answers, e.answerLang));
    case 'match':
      return typeof r === 'number' ? (r === 0 ? 'right' : 'wrong') : null;
  }
}

/** The correct answer as shown in the feedback. `truefalse` has no text of its own: the caller labels it. */
export function correctText(e: Exercise): string {
  switch (e.type) {
    case 'choice':
    case 'listen':
      return e.options[e.answer];
    case 'fill':
    case 'order':
    case 'translate':
      return e.answers[0];
    case 'match':
      return e.pairs.map((p) => `${p.fi} = ${p.en}`).join('; ');
    case 'truefalse':
      return String(e.answer);
  }
}

/** The tiles of an `order` exercise, unshuffled. */
export const tilesFor = (e: Order) => [...e.answers[0].split(/\s+/), ...(e.tiles ?? [])];

export type MatchState = { done: number[]; mistakes: number };

/** Pair left item `left` with right item `right`; items are pair indices, so they match when equal. */
export function pick(s: MatchState, left: number, right: number): MatchState {
  return left === right ? { ...s, done: [...s.done, left] } : { ...s, mistakes: s.mistakes + 1 };
}

export const isMatched = (s: MatchState, e: Match) => s.done.length === e.pairs.length;
