import type { Lang, Lesson, Unit } from './types';
import { isUnlocked, testedOut, type Progress } from './progress';
import { splitWords } from './words';

/** The five sections of SPEC section 4, as stages of the course. */
export const stages: Record<number, { level: string; name: Record<Lang, string> }> = {
  1: { level: 'A1', name: { en: 'Starter', fi: 'Alku' } },
  2: { level: 'A1', name: { en: 'Basics', fi: 'Perusteet' } },
  3: { level: 'A2', name: { en: 'Everyday', fi: 'Arki' } },
  4: { level: 'B1', name: { en: 'Upper', fi: 'Jatko' } },
  5: { level: 'B2', name: { en: 'Advanced', fi: 'Syventävä' } },
};

export type LessonState = 'done' | 'open' | 'locked';

export const lessonIds = (units: Unit[]) => units.flatMap((u) => u.lessons.map((l) => l.id));

export function lessonState(p: Progress, ids: string[], lessonId: string): LessonState {
  if (lessonId in p.done) return 'done';
  return isUnlocked(p, ids, lessonId) ? 'open' : 'locked';
}

/** The first lesson that is neither done nor tested out, with its unit; null when the course is finished. */
export function nextLesson(units: Unit[], p: Progress): { unit: Unit; lesson: Lesson; index: number } | null {
  for (const unit of units)
    for (const [index, lesson] of unit.lessons.entries())
      if (!(lesson.id in p.done) && !testedOut(p, lesson.id)) return { unit, lesson, index };
  return null;
}

/** Lessons finished or tested out in a set of units. */
export function lessonsDone(units: Unit[], p: Progress) {
  return units.flatMap((u) => u.lessons).filter((l) => l.id in p.done || testedOut(p, l.id)).length;
}

/**
 * The seven days of the current week, Monday first, each marked when it falls inside the
 * current streak. The save keeps only the streak's last day and length, which is enough.
 */
export function streakWeek(p: Progress, today: string): { day: string; on: boolean; today: boolean }[] {
  const [y, m, d] = today.split('-').map(Number);
  const now = new Date(y, m - 1, d);
  const monday = new Date(y, m - 1, d - ((now.getDay() + 6) % 7));
  const iso = (x: Date) => `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
  const streakDays = new Set<string>();
  if (p.streak.lastDay) {
    const [ly, lm, ld] = p.streak.lastDay.split('-').map(Number);
    for (let i = 0; i < p.streak.count; i++) streakDays.add(iso(new Date(ly, lm - 1, ld - i)));
  }
  return Array.from({ length: 7 }, (_, i) => {
    const day = iso(new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i));
    return { day, on: streakDays.has(day), today: day === today };
  });
}

/** Every Finnish word the unit's exercises use, lower case. Used to highlight them in the grammar tip. */
export function unitVocabulary(unit: Unit): Set<string> {
  const words = new Set<string>();
  const add = (text: string) => {
    for (const part of splitWords(text)) if (part.word) words.add(part.text.toLowerCase());
  };
  for (const e of unit.lessons.flatMap((l) => l.exercises)) {
    if (e.promptLang === 'fi') add(e.prompt);
    if (e.type === 'match') e.pairs.forEach((pair) => add(pair.fi));
    if (e.answerLang !== 'fi') continue;
    if ('options' in e) e.options.forEach((o, i) => !e.invalid?.includes(i) && add(o));
    if ('answers' in e) e.answers.forEach(add);
  }
  return words;
}

export type TipPart = { text: string; finnish: boolean };

/**
 * A tip paragraph split into plain text and Finnish: a word the unit teaches, or an ending
 * written with a leading hyphen (-ko, -vät).
 */
export function tipParts(paragraph: string, vocabulary: Set<string>): TipPart[] {
  const out: TipPart[] = [];
  const push = (text: string, finnish: boolean) => {
    const last = out[out.length - 1];
    if (last && !last.finnish && !finnish) last.text += text;
    else out.push({ text, finnish });
  };
  const parts = splitWords(paragraph);
  for (const [i, part] of parts.entries()) {
    const last = out[out.length - 1];
    // "he/she": an English word that happens to be Finnish too, joined by a slash
    if (part.word && parts[i + 1]?.text === '/') {
      push(part.text, false);
      continue;
    }
    // an ending: the word follows a hyphen that starts a token ("add -ko", "-ko/-kö")
    if (part.word && last && !last.finnish && /(^|[\s(/])-$/.test(last.text)) {
      last.text = last.text.slice(0, -1);
      push('-' + part.text, true);
    } else push(part.text, part.word && vocabulary.has(part.text.toLowerCase()));
  }
  return out.filter((p) => p.text !== '');
}
