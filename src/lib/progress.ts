import type { Lang } from './types';

const KEY = 'suomi-progress';
export const XP_LESSON = 10;
export const XP_PERFECT_BONUS = 5;

export type Progress = {
  v: 1;
  xp: number;
  streak: { count: number; best: number; lastDay: string | null };
  goal: number;
  lang: Lang;
  /** Id of an avatar in the design system; '' means the first one. */
  avatar: string;
  theme: 'auto' | 'light' | 'dark';
  haptics: boolean;
  /** Exercises seen in finished lessons, and how many were right first time. Counted from the version that added it. */
  stats: { answered: number; firstTry: number };
  /** XP earned on `date`, for the daily goal. */
  day: { date: string | null; xp: number };
  /** Finished lessons. `best` is the highest number of exercises answered right first time. */
  done: Record<string, { best: number; at: string }>;
  /** Exercise id to number of times answered wrong. Feeds the review session. */
  mistakes: Record<string, number>;
  /** First unit that is not tested out, set by the level picker or the placement test. null until the learner has chosen. */
  testedOutBefore: string | null;
  /** Spaced-repetition deck: exercise id to its box and the local day it is next due. See review.ts. */
  review: Record<string, { box: number; due: string }>;
  /** Rule id to answers given (n) and score from 0 to 1 (s). See mastery.ts. */
  rules: Record<string, { n: number; s: number }>;
};

export const emptyProgress = (): Progress => ({
  v: 1,
  xp: 0,
  streak: { count: 0, best: 0, lastDay: null },
  goal: 20,
  lang: 'en',
  avatar: '',
  theme: 'auto',
  haptics: true,
  stats: { answered: 0, firstTry: 0 },
  day: { date: null, xp: 0 },
  done: {},
  mistakes: {},
  testedOutBefore: null,
  review: {},
  rules: {},
});

/** Local calendar day as YYYY-MM-DD. Streaks follow the learner's own midnight, not UTC. */
export const localDay = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

function dayBefore(day: string) {
  const [y, m, d] = day.split('-').map(Number);
  return localDay(new Date(y, m - 1, d - 1));
}

/** The streak to show today: it is already broken if the last active day is older than yesterday. */
export function currentStreak(p: Progress, today: string) {
  const { lastDay, count } = p.streak;
  return lastDay === today || lastDay === dayBefore(today) ? count : 0;
}

/** XP earned today; yesterday's count does not carry over. */
export const xpToday = (p: Progress, today: string) => (p.day.date === today ? p.day.xp : 0);

export const XP_REVIEW = 5;

/** Adds XP for a finished session and counts today for the streak and the daily goal. */
export function earn(p: Progress, xpGained: number, today: string): Progress {
  const count = p.streak.lastDay === today ? p.streak.count : currentStreak(p, today) + 1;
  return {
    ...p,
    xp: p.xp + xpGained,
    day: { date: today, xp: xpToday(p, today) + xpGained },
    streak: { count, best: Math.max(p.streak.best, count), lastDay: today },
  };
}

export function completeLesson(p: Progress, lessonId: string, total: number, wrongIds: string[], today: string) {
  const xpGained = XP_LESSON + (wrongIds.length === 0 ? XP_PERFECT_BONUS : 0);
  const mistakes = { ...p.mistakes };
  for (const id of wrongIds) mistakes[id] = (mistakes[id] ?? 0) + 1;
  const score = total - wrongIds.length;
  const progress: Progress = {
    ...earn(p, xpGained, today),
    stats: { answered: p.stats.answered + total, firstTry: p.stats.firstTry + score },
    done: { ...p.done, [lessonId]: { best: Math.max(p.done[lessonId]?.best ?? 0, score), at: today } },
    mistakes,
  };
  return { progress, xpGained };
}

/** Lesson ids start with their unit id: u03-l2 belongs to u03. */
export const testedOut = (p: Progress, lessonId: string) => p.testedOutBefore !== null && lessonId.split('-')[0] < p.testedOutBefore;

/** Lessons open in order: the first one always, the rest once the one before is done or tested out. */
export function isUnlocked(p: Progress, lessonIds: string[], lessonId: string) {
  const i = lessonIds.indexOf(lessonId);
  return i === 0 || (i > 0 && (lessonIds[i - 1] in p.done || testedOut(p, lessonIds[i - 1])));
}

export function load(storage: Pick<Storage, 'getItem'> = localStorage): Progress {
  try {
    const saved = JSON.parse(storage.getItem(KEY) ?? 'null');
    // Spread over defaults so fields added in later versions get a value.
    if (saved?.v === 1) return { ...emptyProgress(), ...saved };
  } catch {
    // Unreadable storage or broken JSON: start fresh instead of crashing on launch.
  }
  return emptyProgress();
}

export function save(p: Progress, storage: Pick<Storage, 'setItem'> = localStorage) {
  try {
    storage.setItem(KEY, JSON.stringify(p));
  } catch {
    // Private mode or full storage: the session still works, it just is not saved.
  }
}
