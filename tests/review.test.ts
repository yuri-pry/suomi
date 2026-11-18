import { describe, expect, test } from 'vitest';
import { addDays, addMistakes, completeReview, dueExercises, dueItems, finishPractice, finishReview, INTERVALS, practiceSession, reviewed, reviewSession, REVIEW_CAP } from '../src/lib/review';
import { emptyProgress, XP_REVIEW, type Progress } from '../src/lib/progress';
import type { Exercise, Rule, Unit } from '../src/lib/types';
import u01 from '../content/u01.json';
import u02 from '../content/u02.json';
import rulesJson from '../content/rules.json';

test('addDays crosses a month boundary', () => {
  expect(addDays('2026-11-30', 1)).toBe('2026-12-01');
  expect(addDays('2026-01-31', 1)).toBe('2026-02-01');
});

test('addDays crosses a year boundary', () => {
  expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
  expect(addDays('2026-12-25', 7)).toBe('2027-01-01');
});

test('addMistakes resets an existing item and leaves the input untouched', () => {
  const original = { ex1: { box: 3, due: '2026-11-10' }, ex2: { box: 2, due: '2026-11-12' } };
  const frozen = { ...original };
  const result = addMistakes(original, ['ex1', 'ex3'], '2026-11-15');
  // ex1 was reset from box 3 to box 0
  expect(result.ex1).toEqual({ box: 0, due: '2026-11-15' });
  // ex2 is carried over unchanged
  expect(result.ex2).toEqual({ box: 2, due: '2026-11-12' });
  // ex3 is new
  expect(result.ex3).toEqual({ box: 0, due: '2026-11-15' });
  // original was not mutated
  expect(original).toEqual(frozen);
});

test('dueItems returns items ordered by due then id, respects the cap, and excludes future items', () => {
  const deck: Record<string, { box: number; due: string }> = {};
  const today = '2026-11-15';
  // Add more than REVIEW_CAP due items to test the cap
  for (let i = 0; i < 20; i++) {
    const id = `ex${String(i).padStart(2, '0')}`;
    deck[id] = { box: 0, due: i < 10 ? '2026-11-14' : '2026-11-15' };
  }
  // Add a future item that should not appear
  deck['future'] = { box: 0, due: '2026-11-16' };

  const due = dueItems(deck, today);

  // Should have exactly REVIEW_CAP items
  expect(due).toHaveLength(REVIEW_CAP);

  // future item is excluded
  expect(due).not.toContain('future');

  // Items due on 2026-11-14 come before items due on 2026-11-15
  const firstFifteenIdx = due.findIndex((id) => deck[id].due === '2026-11-15');
  expect(firstFifteenIdx).toBe(10); // 10 items from the 14th come first

  // Within the same due date, items are sorted by id
  expect(due[0]).toBe('ex00');
  expect(due[9]).toBe('ex09');
  expect(due[10]).toBe('ex10');
});

test('a full walk: one item answered right every time advances through all boxes then is removed', () => {
  const today = '2026-11-15';
  let deck = addMistakes({}, ['ex1'], today);
  expect(deck.ex1).toEqual({ box: 0, due: today });

  // Review right from box 0: box 1, due in 1 day
  deck = reviewed(deck, 'ex1', true, today);
  expect(deck.ex1).toEqual({ box: 1, due: addDays(today, INTERVALS[0]) });
  expect(deck.ex1.due).toBe('2026-11-16');

  // Review right from box 1: box 2, due in 3 days
  const day1 = deck.ex1.due;
  deck = reviewed(deck, 'ex1', true, day1);
  expect(deck.ex1).toEqual({ box: 2, due: addDays(day1, INTERVALS[1]) });
  expect(deck.ex1.due).toBe('2026-11-19');

  // Review right from box 2: box 3, due in 7 days
  const day2 = deck.ex1.due;
  deck = reviewed(deck, 'ex1', true, day2);
  expect(deck.ex1).toEqual({ box: 3, due: addDays(day2, INTERVALS[2]) });
  expect(deck.ex1.due).toBe('2026-11-26');

  // Review right from box 3: box 4, due in 14 days
  const day3 = deck.ex1.due;
  deck = reviewed(deck, 'ex1', true, day3);
  expect(deck.ex1).toEqual({ box: 4, due: addDays(day3, INTERVALS[3]) });
  expect(deck.ex1.due).toBe('2026-12-10');

  // Review right from box 4: box 5, due in 30 days
  const day4 = deck.ex1.due;
  deck = reviewed(deck, 'ex1', true, day4);
  expect(deck.ex1).toEqual({ box: 5, due: addDays(day4, INTERVALS[4]) });
  expect(deck.ex1.due).toBe('2027-01-09');

  // Review right from box 5 (>= INTERVALS.length): item is removed
  const day5 = deck.ex1.due;
  deck = reviewed(deck, 'ex1', true, day5);
  expect(deck).not.toHaveProperty('ex1');
});

test('a wrong answer in box 3 goes back to box 0 due today', () => {
  const deck = { ex1: { box: 3, due: '2026-11-15' } };
  const result = reviewed(deck, 'ex1', false, '2026-11-15');
  expect(result.ex1).toEqual({ box: 0, due: '2026-11-15' });
});

test('reviewing an unknown id changes nothing', () => {
  const deck = { ex1: { box: 1, due: '2026-11-16' } };
  const result = reviewed(deck, 'unknown', true, '2026-11-15');
  expect(result).toBe(deck); // same reference — unchanged
});

test('a review session moves each played item, gives 5 XP and counts for the streak', () => {
  const today = '2026-11-15';
  const p = { ...emptyProgress(), review: addMistakes({}, ['a', 'b', 'c'], today) };
  const next = completeReview(p, ['a', 'b'], ['b'], today);
  expect(next.review).toEqual({ a: { box: 1, due: '2026-11-16' }, b: { box: 0, due: today }, c: { box: 0, due: today } });
  expect(next.xp).toBe(5);
  expect(next.streak.count).toBe(1);
  expect(next.day).toEqual({ date: today, xp: 5 });
});

test('due exercises are found across units and a vanished id is skipped', () => {
  const exercise = (id: string) => ({ id, type: 'truefalse', prompt: '', text: '', answer: true, promptLang: 'fi', answerLang: 'fi' });
  const units = [{ lessons: [{ exercises: [exercise('a')] }] }, { lessons: [{ exercises: [exercise('b')] }] }] as unknown as Unit[];
  const deck = addMistakes({}, ['b', 'gone', 'a'], '2026-11-15');
  expect(dueExercises(units, deck, '2026-11-15').map((e) => e.id)).toEqual(['a', 'b']);
});

describe('review and practice are separate', () => {
  const units = [u01, u02] as unknown as Unit[];
  const rules = rulesJson as Rule[];
  const today = '2026-11-18';
  const l2 = u02.lessons[1].exercises as unknown as Exercise[];
  const l3 = u02.lessons[2].exercises as unknown as Exercise[];
  const wrong = [l2[0].id, l2[1].id, l3[0].id, l3[1].id];

  // Unit 1 finished, unit 2 up to lesson 3, four mistakes due, rules with a few answers each.
  const start = (): Progress => {
    const done = Object.fromEntries([...u01.lessons, ...u02.lessons.slice(0, 3)].map((l) => [l.id, { best: 1, at: today }]));
    const p: Progress = { ...emptyProgress(), testedOutBefore: 'u01', done };
    return {
      ...p,
      rules: { 'verbtype-1': { n: 3, s: 0.5 }, 'question-ko': { n: 2, s: 0.4 }, 'question-words': { n: 2, s: 0.4 } },
      review: addMistakes({}, wrong, '2026-11-17'),
    };
  };
  const practice = (p: Progress) => practiceSession(units, rules, p, today, true);

  test('review is only the due deck', () => {
    const p = start();
    expect(reviewSession(units, p, today, true).map((e) => e.id).sort()).toEqual([...wrong].sort());
    expect(reviewSession(units, { ...p, review: {} }, today, true)).toEqual([]);
  });

  test('review scores every exercise, like a lesson', () => {
    const p = start();
    const played = reviewSession(units, p, today, true);
    const next = finishReview(p, played, [], units, rules, today);
    const count = (tag: string) => played.filter((e) => e.tags?.includes(tag)).length;
    expect(count('verbtype-1') + count('question-ko')).toBeGreaterThan(2);
    expect(next.rules['verbtype-1'].n).toBe(3 + count('verbtype-1'));
    expect(next.rules['question-ko'].n).toBe(2 + count('question-ko'));
  });

  test('practice is still offered after two reviews in a row', () => {
    const p = start();
    const first = finishReview(p, reviewSession(units, p, today, true), [], units, rules, today);
    expect(practice(first).length).toBeGreaterThan(0);
    const again = { ...first, review: addMistakes(first.review, wrong, today) };
    const second = finishReview(again, reviewSession(units, again, today, true), [], units, rules, today);
    expect(practice(second).length).toBeGreaterThan(0);
  });

  test('a practice session has at most 10 exercises and 3 per rule', () => {
    const s = practice({ ...start(), review: {} });
    expect(s.length).toBeLessThanOrEqual(10);
    expect(s.length).toBeGreaterThan(3);
    const per = new Map<string, number>();
    for (const e of s) for (const tag of e.tags ?? []) per.set(tag, (per.get(tag) ?? 0) + 1);
    expect(Math.max(...per.values())).toBeLessThanOrEqual(3);
  });

  test('one practice session cannot master a fresh rule, and a miss joins the deck', () => {
    const fresh: Progress = { ...start(), rules: {}, review: {} };
    const s = practice(fresh);
    const next = finishPractice(fresh, s, [s[0].id], units, rules, today);
    for (const r of Object.values(next.rules)) expect(r.n).toBeLessThan(8);
    expect(next.review[s[0].id]).toEqual({ box: 0, due: today });
    expect(next.xp).toBe(XP_REVIEW);
  });
});
