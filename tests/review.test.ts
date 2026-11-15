import { expect, test } from 'vitest';
import { addDays, addMistakes, dueItems, INTERVALS, reviewed, REVIEW_CAP } from '../src/lib/review';

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
