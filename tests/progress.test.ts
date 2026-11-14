import { expect, test } from 'vitest';
import { completeLesson, currentStreak, emptyProgress, isUnlocked, load, localDay, save } from '../src/lib/progress';

test('localDay uses the local calendar date', () => {
  expect(localDay(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
});

test('a lesson gives 10 XP, or 15 with no mistakes', () => {
  const clean = completeLesson(emptyProgress(), 'u01-l1', 12, [], '2026-11-13');
  expect(clean.xpGained).toBe(15);
  const messy = completeLesson(clean.progress, 'u01-l2', 12, ['x', 'y'], '2026-11-13');
  expect(messy.xpGained).toBe(10);
  expect(messy.progress.xp).toBe(25);
  expect(messy.progress.mistakes).toEqual({ x: 1, y: 1 });
  expect(messy.progress.done['u01-l2'].best).toBe(10);
});

test('streak rises once per day, holds the same day, and resets after a missed day', () => {
  let p = completeLesson(emptyProgress(), 'a', 1, [], '2026-11-13').progress;
  expect(p.streak.count).toBe(1);
  p = completeLesson(p, 'b', 1, [], '2026-11-13').progress;
  expect(p.streak.count).toBe(1);
  p = completeLesson(p, 'c', 1, [], '2026-11-14').progress;
  expect(p.streak.count).toBe(2);
  // 15th missed
  expect(currentStreak(p, '2026-11-15')).toBe(2);
  expect(currentStreak(p, '2026-11-16')).toBe(0);
  p = completeLesson(p, 'd', 1, [], '2026-11-16').progress;
  expect(p.streak).toEqual({ count: 1, best: 2, lastDay: '2026-11-16' });
});

test('streak continues across a month boundary', () => {
  let p = completeLesson(emptyProgress(), 'a', 1, [], '2026-11-30').progress;
  p = completeLesson(p, 'b', 1, [], '2026-12-01').progress;
  expect(p.streak.count).toBe(2);
});

test('lessons unlock in order', () => {
  const ids = ['l1', 'l2', 'l3'];
  const p = completeLesson(emptyProgress(), 'l1', 1, [], '2026-11-13').progress;
  expect(isUnlocked(emptyProgress(), ids, 'l1')).toBe(true);
  expect(isUnlocked(emptyProgress(), ids, 'l2')).toBe(false);
  expect(isUnlocked(p, ids, 'l2')).toBe(true);
  expect(isUnlocked(p, ids, 'l3')).toBe(false);
});

test('progress survives save and load, and bad storage gives a fresh start', () => {
  const store = new Map<string, string>();
  const storage = { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, v) };
  const p = completeLesson(emptyProgress(), 'l1', 3, [], '2026-11-13').progress;
  save(p, storage);
  expect(load(storage)).toEqual(p);
  expect(load({ getItem: () => '{not json' })).toEqual(emptyProgress());
  expect(load({ getItem: () => '{"v":99}' })).toEqual(emptyProgress());
});

test('progress saved before settings and stats existed loads with defaults', () => {
  const old = JSON.stringify({ v: 1, xp: 40, streak: { count: 2, best: 2, lastDay: '2026-11-13' }, goal: 20, lang: 'fi', done: {}, mistakes: {} });
  const p = load({ getItem: () => old });
  expect(p.xp).toBe(40);
  expect(p.stats).toEqual({ answered: 0, firstTry: 0 });
  expect(p.haptics).toBe(true);
  const next = completeLesson(p, 'u01-l1', 12, ['x'], '2026-11-14').progress;
  expect(next.stats).toEqual({ answered: 12, firstTry: 11 });
  expect(next.day).toEqual({ date: '2026-11-14', xp: 10 });
});

