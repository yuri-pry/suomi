import { expect, test } from 'vitest';
import { badWords, matchesForm, validate } from '../scripts/validate-content.mjs';

const fill = (id: string, extra: object = {}) => ({
  id,
  type: 'fill',
  promptLang: 'fi',
  answerLang: 'fi',
  prompt: 'Syön ___.',
  answers: ['omenaa'],
  ...extra,
});
const unit = (exercises: object[]) => ({
  id: 'u99',
  tip: { en: 'tip' },
  lessons: [{ id: 'u99-l1', exercises }],
});

test('Voikko accepts real forms and rejects invented ones', () => {
  expect(badWords('Syön omenaa ja juon kahvia.')).toEqual([]);
  expect(badWords('Syön omenata.')).toEqual(['omenata']);
  expect(badWords('Hei Zorblax', new Set(['zorblax']))).toEqual([]);
});

test('matchesForm checks dictionary form and case', () => {
  expect(matchesForm('omenaa', { base: 'omena', case: 'osanto' })).toBe(true);
  expect(matchesForm('omenan', { base: 'omena', case: 'osanto' })).toBe(false);
  expect(matchesForm('olen', { base: 'olla', person: '1', number: 'singular' })).toBe(true);
});

test('a clean unit passes', () => {
  expect(validate([unit([fill('e1')])], [])).toEqual({ errors: [], warnings: [] });
});

test('a misspelled Finnish word fails and names the exercise', () => {
  const { errors } = validate([unit([fill('e1', { answers: ['omenata'] })])], []);
  expect(errors).toHaveLength(1);
  expect(errors[0]).toContain('e1');
  expect(errors[0]).toContain('omenata');
});

test('a real word in the wrong declared form gives a warning', () => {
  const { errors, warnings } = validate(
    [unit([fill('e1', { answers: ['omenan'], form: { base: 'omena', case: 'osanto' } })])],
    [],
  );
  expect(errors).toEqual([]);
  expect(warnings).toHaveLength(1);
});

test('choice: answer index must be in range and deliberately wrong options are skipped', () => {
  const choice = (extra: object) => ({
    id: 'c1',
    type: 'choice',
    promptLang: 'en',
    answerLang: 'fi',
    prompt: 'table',
    options: ['pöytä', 'pöyta'],
    answer: 0,
    ...extra,
  });
  expect(validate([unit([choice({ invalid: [1] })])], []).errors).toEqual([]);
  expect(validate([unit([choice({})])], []).errors[0]).toContain('pöyta');
  expect(validate([unit([choice({ invalid: [1], answer: 2 })])], []).errors[0]).toContain('out of range');
});

test('duplicate ids and unknown types fail', () => {
  expect(validate([unit([fill('e1'), fill('e1')])], []).errors[0]).toContain('duplicate');
  expect(validate([unit([fill('e1', { type: 'sing' })])], []).errors[0]).toContain('unknown type');
});

test('tags must exist in the rulebook and each rule needs 4 exercises', () => {
  const rule = { id: 'r1', type: 'case', unit: 'u99', title: 't', examples: [{ fi: 'Syön omenaa.', en: 'x' }] };
  expect(validate([unit([fill('e1', { tags: ['nope'] })])], []).errors[0]).toContain('not in rules.json');
  const few = validate([unit([fill('e1', { tags: ['r1'] })])], [rule]);
  expect(few.errors[0]).toContain('needs 4');
  const enough = validate([unit(['e1', 'e2', 'e3', 'e4'].map((id) => fill(id, { tags: ['r1'] })))], [rule]);
  expect(enough.errors).toEqual([]);
});

test('a rektio rule example must use the required case', () => {
  const rektio = (word: string, fi: string) => ({
    id: 'rektio-pitaa-sta',
    type: 'rektio',
    unit: 'u99',
    title: 'pitää + -sta',
    verb: 'pitää',
    requires: 'sisaeronto',
    examples: [{ fi, en: 'I like coffee.', word }],
  });
  const exercises = ['e1', 'e2', 'e3', 'e4'].map((id) => fill(id, { tags: ['rektio-pitaa-sta'] }));
  expect(validate([unit(exercises)], [rektio('kahvista', 'Pidän kahvista.')]).errors).toEqual([]);
  expect(validate([unit(exercises)], [rektio('kahvia', 'Pidän kahvia.')]).errors[0]).toContain('not in case');
  // "kuusta" has two readings (kuu elative, kuusi partitive); either may satisfy the rule
  expect(validate([unit(exercises)], [rektio('kuusta', 'Pidän kuusta.')]).errors).toEqual([]);
  expect(
    validate([unit(exercises)], [{ ...rektio('kuusta', 'Katson kuusta.'), requires: 'osanto' }]).errors,
  ).toEqual([]);
});
