// Checks every content file. Run by `npm test`. See SPEC.md section 3b.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import BaseVoikko from 'voikko';

let voikko;
const fi = () => (voikko ??= BaseVoikko().init('fi'));

const TYPES = ['choice', 'fill', 'listen', 'match', 'order', 'translate', 'truefalse'];
const RULE_TYPES = ['rektio', 'case', 'verbtype', 'wordtype', 'gradation', 'phonology', 'object', 'tense', 'mood', 'sentence', 'construction', 'clitic'];
const MIN_EXERCISES_PER_RULE = 4;

const words = (text) => text.match(/\p{L}+(?:[-'’]\p{L}+)*/gu) ?? [];

/** Finnish words in `text` that Voikko rejects and the allow list does not cover. */
export function badWords(text, allow = new Set()) {
  return words(text).filter((w) => !allow.has(w.toLowerCase()) && !fi().spell(w));
}

/** True when Voikko analyses `word` as the declared form. `case` maps to Voikko's SIJAMUOTO. */
export function matchesForm(word, form) {
  const { base, ...attrs } = form;
  return fi()
    .analyze(word)
    .some(
      (a) =>
        a.BASEFORM === base &&
        Object.entries(attrs).every(([k, v]) => a[k === 'case' ? 'SIJAMUOTO' : k.toUpperCase()] === v),
    );
}

export function validate(units, rules, allow = new Set()) {
  const errors = [];
  const warnings = [];
  const seen = new Set();
  const ruleIds = new Set(rules.map((r) => r.id));
  const ruleUse = new Map(rules.map((r) => [r.id, 0]));
  const unique = (id, what) => {
    if (!id) errors.push(`${what}: missing id`);
    else if (seen.has(id)) errors.push(`${id}: duplicate id`);
    seen.add(id);
  };
  const finnish = (id, where, text) => {
    const bad = badWords(text, allow);
    if (bad.length) errors.push(`${id}: ${where} has words Voikko rejects: ${bad.join(', ')}`);
  };

  for (const r of rules) {
    unique(r.id, 'rule');
    if (!RULE_TYPES.includes(r.type)) errors.push(`${r.id}: unknown rule type ${r.type}`);
    if (!r.examples?.length) errors.push(`${r.id}: rule has no examples`);
    for (const ex of r.examples ?? []) {
      finnish(r.id, 'example', ex.fi);
      if (r.type !== 'rektio') continue;
      if (!(r.requires || r.requiresMood) || !ex.word)
        errors.push(`${r.id}: rektio rule needs "requires" or "requiresMood", and a "word" in each example`);
      // Any analysis may match: "kuusta" is both kuu (elative) and kuusi (partitive).
      else if (
        !fi()
          .analyze(ex.word)
          .some(
            (a) =>
              (!r.requires || a.SIJAMUOTO === r.requires) && (!r.requiresMood || a.MOOD === r.requiresMood),
          )
      )
        errors.push(`${r.id}: "${ex.word}" is not in case ${[r.requiresMood, r.requires].filter(Boolean).join(' ')}`);
    }
    if (r.ref && !r.ref.startsWith('https://')) errors.push(`${r.id}: ref must be an https link`);
  }

  for (const unit of units) {
    unique(unit.id, 'unit');
    if (!unit.tip?.en) errors.push(`${unit.id}: missing tip`);
    for (const lesson of unit.lessons ?? []) {
      unique(lesson.id, 'lesson');
      if (!lesson.exercises?.length) errors.push(`${lesson.id}: lesson has no exercises`);
      for (const e of lesson.exercises ?? []) {
        unique(e.id, 'exercise');
        if (!TYPES.includes(e.type)) {
          errors.push(`${e.id}: unknown type ${e.type}`);
          continue;
        }
        for (const k of ['promptLang', 'answerLang'])
          if (e[k] !== 'fi' && e[k] !== 'en') errors.push(`${e.id}: ${k} must be "fi" or "en"`);
        for (const tag of e.tags ?? []) {
          if (!ruleIds.has(tag)) errors.push(`${e.id}: tag "${tag}" is not in rules.json`);
          else ruleUse.set(tag, ruleUse.get(tag) + 1);
        }
        if (typeof e.prompt !== 'string') {
          errors.push(`${e.id}: prompt must be a string`);
          continue;
        }
        if (e.promptLang === 'fi') finnish(e.id, 'prompt', e.prompt.replaceAll('___', ' '));

        if (e.type === 'listen' && e.promptLang !== 'fi') errors.push(`${e.id}: listen prompt must be Finnish`);

        if (e.type === 'choice' || e.type === 'listen') {
          const invalid = e.invalid ?? [];
          if (!(e.options?.length >= 2)) errors.push(`${e.id}: needs at least 2 options`);
          else if (!Number.isInteger(e.answer) || e.answer < 0 || e.answer >= e.options.length)
            errors.push(`${e.id}: answer index out of range`);
          if (invalid.includes(e.answer)) errors.push(`${e.id}: the correct option is marked invalid`);
          if (e.answerLang === 'fi')
            (e.options ?? []).forEach((o, i) => invalid.includes(i) || finnish(e.id, `option ${i}`, o));
        }

        const hasAnswers = () => {
          const ok = Array.isArray(e.answers) && e.answers.length > 0 && e.answers.every((a) => typeof a === 'string' && a.trim());
          if (!ok) errors.push(`${e.id}: needs at least one accepted answer`);
          return ok;
        };

        if (e.type === 'match') {
          if (e.prompt !== '') errors.push(`${e.id}: match prompt must be an empty string`);
          const pairs = e.pairs;
          if (!Array.isArray(pairs) || pairs.length < 4 || pairs.length > 5) errors.push(`${e.id}: match needs 4 or 5 pairs`);
          else if (!pairs.every((p) => typeof p?.fi === 'string' && typeof p?.en === 'string' && p.fi.trim() && p.en.trim()))
            errors.push(`${e.id}: every pair needs non-empty fi and en`);
          else {
            for (const side of ['fi', 'en'])
              if (new Set(pairs.map((p) => p[side].trim().toLowerCase())).size < pairs.length)
                errors.push(`${e.id}: duplicate ${side} word in pairs`);
            pairs.forEach((p) => finnish(e.id, 'pair', p.fi));
          }
        }

        if (e.type === 'order' && hasAnswers()) {
          const extra = e.tiles ?? [];
          // Grading ignores case and trailing punctuation, so tiles are compared the same way.
          const split = (s) => s.trim().toLowerCase().replace(/[.!?,;:]+$/, '').split(/\s+/);
          if (!Array.isArray(extra) || !extra.every((x) => typeof x === 'string' && x.trim() && split(x).length === 1))
            errors.push(`${e.id}: tiles must be single words`);
          else {
            if (split(e.answers[0]).length < 2) errors.push(`${e.id}: order answer needs at least 2 words`);
            const pool = [...split(e.answers[0]), ...extra];
            // An accepted sentence the tiles cannot build could never be given.
            for (const a of e.answers) {
              const left = [...pool];
              const missing = split(a).find((w) => {
                const at = left.indexOf(w);
                if (at >= 0) left.splice(at, 1);
                return at < 0;
              });
              if (missing !== undefined) errors.push(`${e.id}: "${a}" cannot be built from the tiles (no ${missing})`);
            }
            if (e.answerLang === 'fi') [...e.answers, ...extra].forEach((a) => finnish(e.id, 'answer or tile', a));
          }
        }

        if (e.type === 'translate' && hasAnswers() && e.answerLang === 'fi')
          e.answers.forEach((a) => finnish(e.id, 'answer', a));

        if (e.type === 'truefalse') {
          if (typeof e.answer !== 'boolean') errors.push(`${e.id}: answer must be true or false`);
          if (typeof e.text !== 'string' || !e.text.trim()) errors.push(`${e.id}: needs text`);
          else if (e.promptLang === 'fi') finnish(e.id, 'text', e.text);
          if (e.answerLang !== e.promptLang) errors.push(`${e.id}: answerLang must equal promptLang`);
        }

        if (e.type === 'fill') {
          if (!e.prompt.includes('___')) errors.push(`${e.id}: fill prompt needs ___`);
          if (!e.answers?.length) errors.push(`${e.id}: needs at least one accepted answer`);
          if (e.answerLang === 'fi') (e.answers ?? []).forEach((a) => finnish(e.id, 'answer', a));
          // A warning, not an error: Voikko's analysis sometimes differs from textbook labels.
          if (e.form && e.answers?.length && !matchesForm(e.answers[0], e.form))
            warnings.push(`${e.id}: "${e.answers[0]}" is not analysed as ${JSON.stringify(e.form)}`);
        }
      }
    }
  }

  for (const [id, n] of ruleUse)
    if (n < MIN_EXERCISES_PER_RULE) errors.push(`${id}: rule has ${n} exercises, needs ${MIN_EXERCISES_PER_RULE}`);

  return { errors, warnings };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = join(dirname(fileURLToPath(import.meta.url)), '..');
  const dir = join(root, 'content');
  const read = (f) => JSON.parse(readFileSync(f, 'utf8'));
  const units = readdirSync(dir).filter((f) => /^u\d+\.json$/.test(f)).map((f) => read(join(dir, f)));
  const rules = existsSync(join(dir, 'rules.json')) ? read(join(dir, 'rules.json')) : [];
  const allowFile = join(root, 'scripts', 'allowlist.txt');
  const allow = new Set(
    existsSync(allowFile)
      ? readFileSync(allowFile, 'utf8').split(/\r?\n/).map((l) => l.trim().toLowerCase()).filter((l) => l && !l.startsWith('#'))
      : [],
  );
  const { errors, warnings } = validate(units, rules, allow);
  warnings.forEach((w) => console.warn('warning:', w));
  errors.forEach((e) => console.error('error:', e));
  const count = units.reduce((n, u) => n + u.lessons.reduce((m, l) => m + l.exercises.length, 0), 0);
  console.log(`content: ${units.length} units, ${count} exercises, ${rules.length} rules, ${errors.length} errors, ${warnings.length} warnings`);
  process.exit(errors.length ? 1 : 0);
}
