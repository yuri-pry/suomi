import { expect, test } from 'vitest';
import { checkpointUnlocked, completeCheckpoint, completeLesson, currentStreak, emptyProgress, isUnlocked, load, localDay, save, unitPassed } from '../src/lib/progress';

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
  const units = [{ id: 'u', lessons: ['l1', 'l2', 'l3'].map((id) => ({ id })) }];
  const p = completeLesson(emptyProgress(), 'l1', 1, [], '2026-11-13').progress;
  expect(isUnlocked(emptyProgress(), units, 'l1')).toBe(true);
  expect(isUnlocked(emptyProgress(), units, 'l2')).toBe(false);
  expect(isUnlocked(p, units, 'l2')).toBe(true);
  expect(isUnlocked(p, units, 'l3')).toBe(false);
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
  expect(p.testedOutBefore).toBeNull();
  expect(p.review).toEqual({});
  const next = completeLesson(p, 'u01-l1', 12, ['x'], '2026-11-14').progress;
  expect(next.stats).toEqual({ answered: 12, firstTry: 11 });
  expect(next.day).toEqual({ date: '2026-11-14', xp: 10 });
});


const units = ['u01', 'u02', 'u03', 'u04'].map((id) => ({ id, lessons: [1, 2].map((n) => ({ id: `${id}-l${n}` })) }));
const open = (p: ReturnType<typeof emptyProgress>) => units.flatMap((u) => u.lessons).map((l) => isUnlocked(p, units, l.id));
const doneIds = (...ids: string[]) => ({ ...emptyProgress(), done: Object.fromEntries(ids.map((id) => [id, { best: 1, at: 'x' }])) });

test('a placement result opens the tested-out units and the first lesson of the start unit', () => {
  const p = { ...emptyProgress(), testedOutBefore: 'u03' };
  expect(open(p)).toEqual([true, true, true, true, true, false, false, false]);
});

test('the next unit stays locked after the last lesson, until the checkpoint is passed', () => {
  const p = doneIds('u01-l1', 'u01-l2');
  expect(open(p).slice(2)).toEqual([false, false, false, false, false, false]);
  expect(checkpointUnlocked(emptyProgress(), units, 0)).toBe(false);
  expect(checkpointUnlocked(p, units, 0)).toBe(true);
  const passed = completeCheckpoint(p, 'u01', 15, ['a', 'b', 'c'], '2026-11-13').progress;
  expect(open(passed).slice(2, 5)).toEqual([true, false, false]);
});

test('a failed checkpoint unlocks nothing, gives no XP and still counts for the streak', () => {
  const r = completeCheckpoint(doneIds('u01-l1', 'u01-l2'), 'u01', 15, ['a', 'b', 'c', 'd'], '2026-11-13');
  expect(r.passed).toBe(false);
  expect(r.xpGained).toBe(0);
  expect(r.progress.xp).toBe(0);
  expect(r.progress.streak.count).toBe(1);
  expect(r.progress.mistakes).toEqual({ a: 1, b: 1, c: 1, d: 1 });
  expect('u01-cp' in r.progress.done).toBe(false);
  expect(isUnlocked(r.progress, units, 'u02-l1')).toBe(false);
});

test('12 of 15 right passes for 20 XP and is stored as u01-cp', () => {
  const r = completeCheckpoint(emptyProgress(), 'u01', 15, ['a', 'b', 'c'], '2026-11-13');
  expect(r.passed).toBe(true);
  expect(r.xpGained).toBe(20);
  expect(r.progress.xp).toBe(20);
  expect(r.progress.done['u01-cp'].best).toBe(12);
  expect(completeCheckpoint(r.progress, 'u01', 15, [], '2026-11-13').progress.done['u01-cp'].best).toBe(15);
});

test('a unit is passed when tested out or when a later unit has a finished lesson', () => {
  expect(unitPassed({ ...emptyProgress(), testedOutBefore: 'u02' }, units, 0)).toBe(true);
  expect(unitPassed({ ...emptyProgress(), testedOutBefore: 'u02' }, units, 1)).toBe(false);
  const legacy = doneIds('u01-l1', 'u01-l2', 'u02-l1', 'u02-l2', 'u03-l1');
  expect(unitPassed(legacy, units, 0)).toBe(true);
  expect(unitPassed(legacy, units, 1)).toBe(true);
  expect(unitPassed(legacy, units, 2)).toBe(false);
  expect(isUnlocked(legacy, units, 'u03-l2')).toBe(true);
  expect(isUnlocked(legacy, units, 'u04-l1')).toBe(false);
});
