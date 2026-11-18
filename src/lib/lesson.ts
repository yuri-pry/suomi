import type { Exercise, Unit } from './types';

export type LessonState = {
  queue: Exercise[];
  /** Exercises in the lesson itself, not counting the retry round. */
  total: number;
  /** Answers given so far, retries included. */
  done: number;
  /** Exercises missed in the first round, in order; asked once more after the last new one. */
  missed: Exercise[];
  /** Size of the retry round, 0 until it starts. */
  retries: number;
  /** Ids answered wrong at least once, in order of first mistake. */
  wrong: string[];
};

/** Without a Finnish voice the lesson simply has no listening exercises. */
export const playable = (exercises: Exercise[], canSpeak: boolean) =>
  canSpeak ? exercises : exercises.filter((e) => e.type !== 'listen');

export const startLesson = (exercises: Exercise[]): LessonState => ({
  queue: [...exercises],
  total: exercises.length,
  done: 0,
  missed: [],
  retries: 0,
  wrong: [],
});

/**
 * Every answer moves on. The exercises missed in the first round come back once, after the
 * last new one; a second miss shows the answer and is not asked again.
 */
export function answer(s: LessonState, correct: boolean): LessonState {
  const [current, ...rest] = s.queue;
  if (!current) return s;
  const inRetry = s.retries > 0;
  const wrong = !correct && !s.wrong.includes(current.id) ? [...s.wrong, current.id] : s.wrong;
  const missed = !correct && !inRetry ? [...s.missed, current] : s.missed;
  const next = { ...s, queue: rest, done: s.done + 1, wrong, missed };
  return rest.length === 0 && !inRetry && missed.length > 0 ? { ...next, queue: missed, retries: missed.length } : next;
}

export const isDone = (s: LessonState) => s.queue.length === 0;

/** Position in the retry round, 1-based; 0 while the lesson's own exercises are being asked. */
export const retryPosition = (s: LessonState) => (s.retries ? s.retries - s.queue.length + 1 : 0);

export const fractionDone = (s: LessonState) => s.done / (s.total + s.retries);

export function shuffle<T>(items: T[], random = Math.random): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export const CHECKPOINT_SIZE = 15;

/** A checkpoint is 15 exercises drawn at random from the unit's lessons; a unit with fewer playable ones uses them all. */
export const drawCheckpoint = (unit: Unit, canSpeak: boolean, random = Math.random) =>
  shuffle(playable(unit.lessons.flatMap((l) => l.exercises), canSpeak), random).slice(0, CHECKPOINT_SIZE);
