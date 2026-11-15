import { expect, test } from 'vitest';
import { emptyProgress, type Progress } from '../src/lib/progress';
import { lessonsDone, nextLesson, streakWeek, tipParts, unitVocabulary } from '../src/lib/course';
import type { Unit } from '../src/lib/types';

const unit = (id: string, n: number): Unit => ({
  id,
  section: 1,
  title: id,
  tip: { en: '' },
  lessons: Array.from({ length: n }, (_, i) => ({ id: `${id}-l${i + 1}`, title: `L${i + 1}`, exercises: [] })),
});

test('nextLesson is the first lesson neither done nor tested out', () => {
  const units = [unit('u01', 2), unit('u02', 2)];
  const p: Progress = { ...emptyProgress(), done: { 'u01-l1': { best: 1, at: '2026-11-15' } } };
  expect(nextLesson(units, p)?.lesson.id).toBe('u01-l2');
  expect(nextLesson(units, { ...p, testedOutBefore: 'u02' })?.lesson.id).toBe('u02-l1');
  expect(lessonsDone(units, { ...p, testedOutBefore: 'u02' })).toBe(2);
});

test('streakWeek marks the streak days of this week, Monday first', () => {
  // Sunday 2026-11-15, a three-day streak: Friday to Sunday
  const p: Progress = { ...emptyProgress(), streak: { count: 3, best: 3, lastDay: '2026-11-15' } };
  const week = streakWeek(p, '2026-11-15');
  expect(week[0].day).toBe('2026-11-09');
  expect(week.map((d) => d.on)).toEqual([false, false, false, false, true, true, true]);
  expect(week[6].today).toBe(true);
});

test('tip highlights the unit words and hyphenated endings', () => {
  const u: Unit = {
    ...unit('u02', 0),
    lessons: [{ id: 'x', title: 'x', exercises: [{ id: 'e', type: 'choice', promptLang: 'en', answerLang: 'fi', prompt: 'I speak', options: ['puhun', 'puhut'], answer: 0 }] }],
  };
  const vocab = unitVocabulary(u);
  expect(vocab.has('puhun')).toBe(true);
  const parts = tipParts('Say Puhun, then add -ko or -kö.', vocab);
  expect(parts.filter((p) => p.finnish).map((p) => p.text)).toEqual(['Puhun', '-ko', '-kö']);
  expect(parts.map((p) => p.text).join('')).toBe('Say Puhun, then add -ko or -kö.');
  expect(tipParts('In the puhun/she form', vocab).some((p) => p.finnish)).toBe(false);
});
