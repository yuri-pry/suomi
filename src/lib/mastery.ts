import { testedOut, type Progress } from './progress';
import type { Exercise, Rule, Unit } from './types';

// Starting values with no data behind them (SPEC section 7); tune after real use.
export const WEIGHT = 0.8;
export const MASTERED_S = 0.8;
export const MASTERED_N = 8;
export const SECTION_COMPLETE = 0.8;
export const SECTIONS = 5;

export type RuleScore = { n: number; s: number };

/** Units whose lessons are all finished. Saves from before rule scores existed have lessons done but no scores. */
export const finishedUnits = (p: Progress, units: Unit[]) =>
  new Set(units.filter((u) => u.lessons.length > 0 && u.lessons.every((l) => l.id in p.done)).map((u) => u.id));

/** A rule's score. Rules of tested-out or fully finished units count as mastered until an answer says otherwise. */
export const ruleState = (p: Progress, rule: Rule, finished: Set<string> = new Set()): RuleScore =>
  p.rules[rule.id] ?? (testedOut(p, rule.unit) || finished.has(rule.unit) ? { n: MASTERED_N, s: MASTERED_S } : { n: 0, s: 0 });

export const scored = (r: RuleScore, correct: boolean): RuleScore => ({
  n: r.n + 1,
  s: WEIGHT * r.s + (1 - WEIGHT) * (correct ? 1 : 0),
});

export const isMastered = (r: RuleScore) => r.s >= MASTERED_S && r.n >= MASTERED_N;

/**
 * One answer per played exercise, judged on the first try: a wrong answer is retried once at
 * the end, so counting the retry would inflate the score. With `perRule` a rule gets one answer
 * for the whole session (right when none of its exercises was missed): a review replays the same
 * few exercises of a rule, and counting each as fresh evidence would master it in one sitting.
 */
export function scoreAnswers(p: Progress, rules: Rule[], played: Exercise[], wrongIds: string[], units: Unit[] = [], perRule = false): Progress {
  const finished = finishedUnits(p, units);
  const byId = new Map(rules.map((r) => [r.id, r]));
  const next = { ...p.rules };
  const missed = new Set<string>();
  const seen = new Set<string>();
  for (const e of played)
    for (const tag of e.tags ?? []) {
      const rule = byId.get(tag);
      if (!rule) continue;
      const wrong = wrongIds.includes(e.id);
      if (perRule) {
        if (wrong) missed.add(tag);
        seen.add(tag);
        continue;
      }
      next[tag] = scored(next[tag] ?? ruleState(p, rule, finished), !wrong);
    }
  for (const tag of seen) next[tag] = scored(next[tag] ?? ruleState(p, byId.get(tag)!, finished), !missed.has(tag));
  return { ...p, rules: next };
}

/**
 * Level = sections complete in order from section 1 (mean rule credit at least SECTION_COMPLETE), plus the credit of the first incomplete
 * one. `section` is that first incomplete section, or the last one when all are complete.
 */
export function level(p: Progress, rules: Rule[], units: Unit[]) {
  const sectionOf = new Map(units.map((u) => [u.id, u.section]));
  // shortcut: a section's total is the rules written so far, so a half-written section can count as complete; take totals from tasks/rulebook-map.md once sections fill up.
  const finished = finishedUnits(p, units);
  const total = Array<number>(SECTIONS + 1).fill(0);
  const done = Array<number>(SECTIONS + 1).fill(0);
  // Partial credit, so the level moves from the first answers: s counts in full once a rule has 8 answers.
  const credit = Array<number>(SECTIONS + 1).fill(0);
  for (const r of rules) {
    const s = sectionOf.get(r.unit);
    if (!s) continue;
    total[s]++;
    const rs = ruleState(p, r, finished);
    if (isMastered(rs)) done[s]++;
    credit[s] += rs.s * Math.min(1, rs.n / MASTERED_N);
  }
  let value = 0;
  let section = 1;
  for (; section <= SECTIONS; section++) {
    const share = total[section] ? credit[section] / total[section] : 0;
    if (share < SECTION_COMPLETE - 1e-9) {
      value += share;
      break;
    }
    value++;
  }
  const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);
  // `exact` is for the bar and a two-decimal display, so the first answers show.
  return { level: Math.round(value * 10) / 10, exact: value, section: Math.min(section, SECTIONS), mastered: sum(done), total: sum(total) };
}

/**
 * Review after the saved mistakes: exercises for the not yet mastered rules, weakest
 * first, one per rule in turn so one rule does not fill the session. Only lessons the learner
 * has finished or tested out are drawn from, and ids in `exclude` (already due) are skipped.
 */
export function weakExercises(units: Unit[], rules: Rule[], p: Progress, exclude: Set<string>): Exercise[] {
  const open = units.flatMap((u) => u.lessons.filter((l) => l.id in p.done || testedOut(p, l.id)).flatMap((l) => l.exercises));
  const weak = rules
    .map((r) => ({ id: r.id, ...ruleState(p, r, finishedUnits(p, units)) }))
    .filter((r) => !isMastered(r))
    .sort((a, b) => a.s - b.s || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  const lists = weak.map((r) => open.filter((e) => e.tags?.includes(r.id) && !exclude.has(e.id)));
  const out: Exercise[] = [];
  const seen = new Set<string>();
  for (let i = 0; lists.some((l) => i < l.length); i++)
    for (const l of lists)
      if (l[i] && !seen.has(l[i].id)) {
        seen.add(l[i].id);
        out.push(l[i]);
      }
  return out;
}
