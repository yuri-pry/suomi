import type { Exercise, Unit } from './types';

export type LessonState = {
  queue: Exercise[];
  total: number;
  /** Ids answered wrong at least once, in order of first mistake. */
  wrong: string[];
};

/** Without a Finnish voice the lesson simply has no listening exercises. */
export const playable = (exercises: Exercise[], canSpeak: boolean) =>
  canSpeak ? exercises : exercises.filter((e) => e.type !== 'listen');

export const startLesson = (exercises: Exercise[]): LessonState => ({
  queue: [...exercises],
  total: exercises.length,
  wrong: [],
});

/** A wrong answer sends the exercise to the end of the queue; the lesson ends when the queue is empty. */
export function answer(s: LessonState, correct: boolean): LessonState {
  const [current, ...rest] = s.queue;
  if (!current) return s;
  if (correct) return { ...s, queue: rest };
  return {
    ...s,
    queue: [...rest, current],
    wrong: s.wrong.includes(current.id) ? s.wrong : [...s.wrong, current.id],
  };
}

export const isDone = (s: LessonState) => s.queue.length === 0;

export const fractionDone = (s: LessonState) => (s.total - s.queue.length) / s.total;

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
