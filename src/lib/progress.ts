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
  /** Finished lessons. `best` is the highest number of exercises answered right first time. */
  done: Record<string, { best: number; at: string }>;
  /** Exercise id to number of times answered wrong. Feeds the review session. */
  mistakes: Record<string, number>;
};

export const emptyProgress = (): Progress => ({
  v: 1,
  xp: 0,
  streak: { count: 0, best: 0, lastDay: null },
  goal: 20,
  lang: 'en',
  done: {},
  mistakes: {},
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

export function completeLesson(p: Progress, lessonId: string, total: number, wrongIds: string[], today: string) {
  const xpGained = XP_LESSON + (wrongIds.length === 0 ? XP_PERFECT_BONUS : 0);
  const count = p.streak.lastDay === today ? p.streak.count : currentStreak(p, today) + 1;
  const mistakes = { ...p.mistakes };
  for (const id of wrongIds) mistakes[id] = (mistakes[id] ?? 0) + 1;
  const score = total - wrongIds.length;
  const progress: Progress = {
    ...p,
    xp: p.xp + xpGained,
    streak: { count, best: Math.max(p.streak.best, count), lastDay: today },
    done: { ...p.done, [lessonId]: { best: Math.max(p.done[lessonId]?.best ?? 0, score), at: today } },
    mistakes,
  };
  return { progress, xpGained };
}

/** Lessons open in order: the first one always, the rest once the one before is done. */
export function isUnlocked(p: Progress, lessonIds: string[], lessonId: string) {
  const i = lessonIds.indexOf(lessonId);
  return i === 0 || (i > 0 && lessonIds[i - 1] in p.done);
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
