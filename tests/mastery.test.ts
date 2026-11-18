import { describe, expect, it } from 'vitest';
import { finishedUnits, level, ruleState, scoreAnswers, scored, weakExercises } from '../src/lib/mastery';
import { emptyProgress } from '../src/lib/progress';
import type { Exercise, Rule, Unit } from '../src/lib/types';

const ex = (id: string, tags: string[] = []): Exercise => ({
  id, type: 'translate', prompt: 'x', promptLang: 'en', answerLang: 'fi', answers: ['x'], tags,
});
const rule = (id: string, unit: string): Rule => ({ id, type: 'case', unit, title: id, examples: [] });
const unit = (id: string, section: number, lessons: Unit['lessons'] = []): Unit => ({ id, section, title: id, tip: { en: '' }, lessons });

describe('rule score', () => {
  it('ten right answers give 0.89, a following mistake 0.71', () => {
    let r = ruleState(emptyProgress(), rule('a', 'u01'));
    for (let i = 0; i < 10; i++) r = scored(r, true);
    expect(r.s).toBeCloseTo(0.89, 2);
    r = scored(r, false);
    expect(r.s).toBeCloseTo(0.71, 2);
    expect(r.n).toBe(11);
  });

  it('a tested-out unit starts mastered and scoring starts from that seed', () => {
    const p = { ...emptyProgress(), testedOutBefore: 'u02' };
    expect(ruleState(p, rule('a', 'u01'))).toEqual({ n: 8, s: 0.8 });
    expect(ruleState(p, rule('b', 'u02'))).toEqual({ n: 0, s: 0 });
    const rules = scoreAnswers(p, [rule('a', 'u01')], [ex('e1', ['a'])], ['e1']).rules;
    expect(rules.a.n).toBe(9);
    expect(rules.a.s).toBeCloseTo(0.64, 5);
  });

  it('scores every tag once per exercise, on the first try, and skips untagged ones', () => {
    const rs = [rule('a', 'u01'), rule('b', 'u01')];
    const rules = scoreAnswers(emptyProgress(), rs, [ex('e1', ['a', 'b']), ex('e2', ['a']), ex('e3')], ['e2']).rules;
    expect(rules.a.n).toBe(2);
    expect(rules.a.s).toBeCloseTo(0.8 * 0.2, 5);
    expect(rules.b.n).toBe(1);
    expect(rules.b.s).toBeCloseTo(0.2, 5);
  });
});

describe('level', () => {
  // 5 rules per section; a mastered rule has s 0.9, n 10.
  const units = [1, 2, 3, 4, 5].map((s) => unit(`u0${s}`, s));
  const rules = units.flatMap((u) => [1, 2, 3, 4, 5].map((i) => rule(`${u.id}-r${i}`, u.id)));
  const master = (ids: string[]) => ({ ...emptyProgress(), rules: Object.fromEntries(ids.map((id) => [id, { n: 10, s: 0.9 }])) });

  it('sections 1 and 2 complete with section 3 at 40 percent gives 2.4', () => {
    const p = master([...rules.slice(0, 10).map((r) => r.id), 'u03-r1', 'u03-r2']);
    expect(level(p, rules, units)).toMatchObject({ level: 2.4, section: 3, mastered: 12, total: 25 });
  });

  it('one lesson raises the level above 0 before any rule is mastered', () => {
    const p = scoreAnswers(emptyProgress(), rules, [ex('e1', ['u01-r1']), ex('e2', ['u01-r1'])], []);
    expect(level(p, rules, units).mastered).toBe(0);
    expect(level(p, rules, units).exact).toBeGreaterThan(0);
  });

  it('a unit with all lessons done but no rule scores counts as mastered', () => {
    const us = [unit('u01', 1, [{ id: 'u01-l1', title: '', exercises: [] }]), ...units.slice(1)];
    const p = { ...emptyProgress(), done: { 'u01-l1': { best: 1, at: 'x' } } };
    expect(finishedUnits(p, us)).toEqual(new Set(['u01']));
    expect(level(p, rules, us)).toMatchObject({ level: 1, mastered: 5 });
  });

  it('a section counts as complete at a mean credit of 0.8, and a later section does not count past an incomplete one', () => {
    const p = { ...master(['u01-r1', 'u01-r2', 'u01-r3', 'u01-r4', ...rules.slice(10, 15).map((r) => r.id)]) };
    p.rules['u01-r5'] = { n: 8, s: 0.8 };
    p.rules['u01-r1'] = { n: 8, s: 0.8 };
    expect(level(p, rules, units).level).toBeCloseTo(1, 5);
  });

  it('a section with no rules yet stops the count without dividing by zero', () => {
    const p = master(rules.slice(0, 5).map((r) => r.id));
    expect(level(p, rules.slice(0, 5), units)).toMatchObject({ level: 1, section: 2 });
  });
});

describe('weak-rule review', () => {
  const units = [unit('u01', 1, [
    { id: 'u01-l1', title: '', exercises: [ex('a1', ['a']), ex('a2', ['a']), ex('b1', ['b']), ex('v1')] },
    { id: 'u01-l2', title: '', exercises: [ex('a3', ['a']), ex('c1', ['c'])] },
  ])];
  const rules = [rule('a', 'u01'), rule('b', 'u01'), rule('c', 'u01')];
  const p = {
    ...emptyProgress(),
    done: { 'u01-l1': { best: 1, at: '2026-11-17' } },
    rules: { a: { n: 3, s: 0.5 }, b: { n: 2, s: 0.3 }, c: { n: 2, s: 0.1 } },
  };

  it('with no saved mistakes it serves the weakest seen rules, one exercise per rule in turn', () => {
    expect(weakExercises(units, rules, p, new Set()).map((e) => e.id)).toEqual(['b1', 'a1', 'a2']);
  });

  it('serves unmastered rules of finished lessons even when they have no answers yet', () => {
    const q = { ...p, rules: {} };
    expect(weakExercises(units, rules, q, new Set()).map((e) => e.id)).toEqual(['a1', 'b1', 'a2']);
  });

  it('never serves a locked lesson, a mastered rule or an exercise already due', () => {
    const q = { ...p, rules: { ...p.rules, b: { n: 10, s: 0.9 } } };
    expect(weakExercises(units, rules, q, new Set(['a1'])).map((e) => e.id)).toEqual(['a2']);
  });
});
