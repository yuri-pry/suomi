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

test('a rektio rule can demand an infinitive form', () => {
  const rule = (word: string, extra: object) => ({
    id: 'rektio-menna-maan',
    type: 'rektio',
    unit: 'u99',
    title: 'mennä + -maan',
    verb: 'mennä',
    examples: [{ fi: `Menen ${word}.`, en: 'I go swimming.', word }],
    ...extra,
  });
  const exercises = ['e1', 'e2', 'e3', 'e4'].map((id) => fill(id, { tags: ['rektio-menna-maan'] }));
  const maan = { requires: 'sisatulento', requiresMood: 'MA-infinitive' };
  expect(validate([unit(exercises)], [rule('uimaan', maan)]).errors).toEqual([]);
  // right infinitive, wrong case (-massa instead of -maan)
  expect(validate([unit(exercises)], [rule('uimassa', maan)]).errors[0]).toContain('not in case');
  expect(validate([unit(exercises)], [rule('uida', { requiresMood: 'A-infinitive' })]).errors).toEqual([]);
  expect(validate([unit(exercises)], [rule('uimaan', {})]).errors[0]).toContain('needs "requires"');
});

const ex = (id: string, type: string, extra: object) => ({ id, type, promptLang: 'en', answerLang: 'fi', prompt: 'x', ...extra });
const pair = (fi: string, en: string) => ({ fi, en });
const four = [pair('yksi', 'one'), pair('kaksi', 'two'), pair('kolme', 'three'), pair('neljä', 'four')];
const matchEx = (extra: object = {}) => ex('m1', 'match', { promptLang: 'fi', answerLang: 'en', prompt: '', pairs: four, ...extra });

test('match: 4 or 5 pairs, empty prompt, Finnish side spelled right, no duplicates', () => {
  expect(validate([unit([matchEx()])], []).errors).toEqual([]);
  expect(validate([unit([matchEx({ pairs: four.slice(0, 3) })])], []).errors[0]).toContain('4 or 5');
  expect(validate([unit([matchEx({ prompt: 'Match' })])], []).errors.join('\n')).toContain('empty string');
  expect(validate([unit([matchEx({ pairs: [...four.slice(0, 3), pair('nelja', 'four')] })])], []).errors[0]).toContain('nelja');
  expect(validate([unit([matchEx({ pairs: [...four.slice(0, 3), pair('neljä', 'one')] })])], []).errors[0]).toContain('duplicate');
  expect(validate([unit([matchEx({ pairs: [...four.slice(0, 3), { fi: 'neljä' }] })])], []).errors[0]).toContain('non-empty');
});

test('order: tiles and answers must be buildable and spelled right', () => {
  const order = (extra: object) => ex('o1', 'order', { prompt: 'I am Anna.', answers: ['Minä olen Anna.'], ...extra });
  expect(validate([unit([order({ tiles: ['on'] })])], []).errors).toEqual([]);
  expect(validate([unit([order({ answers: ['Minä olen Anna.', 'Olen Anna.'] })])], []).errors).toEqual([]);
  expect(validate([unit([order({ answers: ['Minä olen Anna.', 'Anna on minä.'] })])], []).errors[0]).toContain('cannot be built');
  expect(validate([unit([order({ tiles: ['olin kotona'] })])], []).errors[0]).toContain('single words');
  expect(validate([unit([order({ tiles: ['omenata'] })])], []).errors[0]).toContain('omenata');
  expect(validate([unit([order({ answers: ['Anna'] })])], []).errors[0]).toContain('at least 2 words');
  expect(validate([unit([order({ answers: [] })])], []).errors[0]).toContain('accepted answer');
  // English answers are not spell checked as Finnish
  expect(validate([unit([order({ answerLang: 'en', answers: ['I am Anna.'] })])], []).errors).toEqual([]);
});

test('translate: Finnish answers are spell checked, English ones are not', () => {
  const tr = (extra: object) => ex('t1', 'translate', { answers: ['Kiitos.'], ...extra });
  expect(validate([unit([tr({})])], []).errors).toEqual([]);
  expect(validate([unit([tr({ answers: ['Kiitos.', 'Kiitoz'] })])], []).errors[0]).toContain('Kiitoz');
  expect(validate([unit([tr({ promptLang: 'fi', answerLang: 'en', prompt: 'Kiitos.', answers: ['Thanks'] })])], []).errors).toEqual([]);
  expect(validate([unit([tr({ answers: [] })])], []).errors[0]).toContain('accepted answer');
});

test('truefalse: boolean answer, text spell checked when Finnish, languages equal', () => {
  const tf = (extra: object) =>
    ex('f1', 'truefalse', { promptLang: 'fi', answerLang: 'fi', text: 'He ovat koulussa.', prompt: 'He ovat kotona.', answer: false, ...extra });
  expect(validate([unit([tf({})])], []).errors).toEqual([]);
  expect(validate([unit([tf({ answer: 'no' })])], []).errors[0]).toContain('true or false');
  expect(validate([unit([tf({ text: 'He ovat koulusa.' })])], []).errors[0]).toContain('koulusa');
  expect(validate([unit([tf({ answerLang: 'en' })])], []).errors[0]).toContain('answerLang');
  expect(validate([unit([tf({ text: '' })])], []).errors[0]).toContain('needs text');
});

const ploy = (id: string, unitId: string, type = 'fill', extra: object = {}) =>
  type === 'fill'
    ? fill(id, { unit: unitId, ...extra })
    : { id, unit: unitId, type: 'choice', promptLang: 'en', answerLang: 'fi', prompt: 'apple', options: ['omena', 'banaani'], answer: 0, ...extra };
const bank = (unitId: string) => [ploy(`${unitId}-1`, unitId), ploy(`${unitId}-2`, unitId), ploy(`${unitId}-3`, unitId, 'choice')];
// one content unit, "u01", so the bank must hold exactly its 3 items
const run = (placement: object[]) => validate([{ ...unit([fill('e1')]), id: 'u01' }], [], new Set(), placement);

test('placement: 3 items per unit, 2 fill and 1 choice passes', () => {
  expect(run(bank('u01')).errors).toEqual([]);
});

test('placement: wrong item count, too few fill, bad type or unit field fail', () => {
  expect(run(bank('u01').slice(0, 2)).errors[0]).toContain('needs 3');
  expect(run([...bank('u01'), ploy('x4', 'u01')]).errors[0]).toContain('needs 3');
  const oneFill = [ploy('a', 'u01'), ploy('b', 'u01', 'choice'), ploy('c', 'u01', 'choice')];
  expect(run(oneFill).errors[0]).toContain('at least 2 fill');
  expect(run([ploy('a', 'u01'), ploy('b', 'u01'), ploy('c', 'u01', 'fill', { type: 'match' })]).errors.join('\n')).toContain('choice or fill');
  expect(run([ploy('a', 'u01'), ploy('b', 'u01'), ploy('c', 'u01', 'choice', { unit: 'one' })]).errors.join('\n')).toContain('"unit"');
});

test('placement: ids are unique across the bank and lessons, Finnish is spell checked', () => {
  expect(run([ploy('e1', 'u01'), ploy('b', 'u01'), ploy('c', 'u01', 'choice')]).errors[0]).toContain('duplicate');
  const misspelled = [ploy('a', 'u01', 'fill', { answers: ['omenata'] }), ploy('b', 'u01'), ploy('c', 'u01', 'choice')];
  expect(run(misspelled).errors[0]).toContain('omenata');
});
