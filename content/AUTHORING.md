---
ontology: true
type: guide
domain: suomi-app
status: active
summary: Self-contained guide for writing one content unit
tags: [content, authoring]
related: [rulebook-map, delegation]
---

# Writing a content unit

Everything a writer needs to produce one unit. You do not need any other project
file except the ones named here.

## What you produce

1. `content/uNN.json`: the unit, with 5 lessons of 8 to 12 exercises (more for new words or a new grammar point, fewer for situation and mix lessons) each.
2. New entries in `content/rules.json` for the unit's grammar rules.
3. If needed, names added to `scripts/allowlist.txt`.

Touch no other file. Do not commit. Do not change `u01.json` or existing rules.

Use `content/u01.json` and `content/rules.json` as the working example of the format.
The type definitions are in `src/lib/types.ts`.

## The learner

An adult learning Finnish through English. They have done every earlier unit and
nothing later. Use only vocabulary and grammar from this unit and earlier units, plus
new words the unit introduces. A word is introduced by a `choice` exercise that shows
its meaning before any exercise asks the learner to type it.

## Lesson pattern

| Lesson | Purpose | Mostly these types |
|---|---|---|
| 1 Words | the unit's core vocabulary, about 20 words | `choice`, `listen` |
| 2 Grammar A | first structure: recognise, then produce | `choice`, then `fill` |
| 3 Grammar B | second structure, same approach | `choice`, then `fill` |
| 4 Situation | phrases and short exchanges from the unit's theme | `choice`, `fill`, `listen` |
| 5 Mix | everything in the unit, plus 3 or 4 items from earlier units | all |

Order exercises from easy to hard inside a lesson. Give each lesson a short English
title.

## Exercise types

Every exercise needs `id`, `type`, `prompt`, `promptLang`, `answerLang`. Ids follow
`u02-l3-e07`: unit, lesson, two-digit number.

`choice`: the learner picks one option.

```json
{ "id": "u02-l1-e01", "type": "choice", "promptLang": "en", "answerLang": "fi",
  "prompt": "I speak", "options": ["minä puhun", "sinä puhut", "hän puhuu"], "answer": 0 }
```

- 3 options, or 2 for a right-or-wrong form pair. The app shuffles them, so put the
  correct one first and set `"answer": 0`.
- Wrong options must be plausible: same word class, same topic, a near form.
- A deliberately impossible form is allowed as a wrong option. List its index in
  `"invalid": [1]` so the spell check skips it.

`fill`: the learner types the missing word.

```json
{ "id": "u02-l2-e08", "type": "fill", "tags": ["verbtype-1"],
  "promptLang": "fi", "answerLang": "fi",
  "prompt": "Minä ___ suomea.", "hint": "puhua", "answers": ["puhun"],
  "form": { "base": "puhua", "person": "1", "number": "singular" } }
```

- The prompt has exactly one `___`.
- `hint` is the dictionary form or an English gloss. It is not spell checked.
- `answers` lists every correct answer in lower case. The sentence must make only
  those answers correct. If two words fit, rewrite the sentence.
- Finnish answers are matched exactly, so a `fill` answer is one word.
- Add `form` whenever the exercise teaches a form. For verbs: `base`, `person`
  ("1", "2", "3"), `number` ("singular", "plural"). For nouns: `base`, `case`.

`listen`: the app speaks the Finnish prompt aloud; the learner picks what they heard.

```json
{ "id": "u02-l1-e13", "type": "listen", "promptLang": "fi", "answerLang": "fi",
  "prompt": "Puhun suomea.", "options": ["Puhun suomea.", "Puhut suomea.", "Puhuu suomea."], "answer": 0 }
```

- `promptLang` is always `fi`. Options are either the Finnish sentence among similar
  sounding ones (`answerLang` `fi`) or English meanings (`answerLang` `en`).
- 2 or 3 per lesson. A lesson must still make sense without them, because devices
  with no Finnish voice skip them.

`match`: the learner pairs 4 or 5 Finnish words with their English words.

```json
{ "id": "u02-l1-e15", "type": "match", "promptLang": "fi", "answerLang": "en", "prompt": "",
  "pairs": [ { "fi": "yksi", "en": "one" }, { "fi": "kaksi", "en": "two" },
             { "fi": "kolme", "en": "three" }, { "fi": "neljä", "en": "four" } ] }
```

- `prompt` is always `""`: the app shows a fixed instruction. Use `"promptLang": "fi"`
  and `"answerLang": "en"`.
- 4 or 5 pairs. The `fi` side is always Finnish and is spell checked. No `fi` or `en`
  value may appear twice. The app shuffles each column on its own.
- One wrong pair makes the whole exercise count as wrong, so keep it to words the
  learner has met.

`order`: the learner taps word tiles into a sentence.

```json
{ "id": "u02-l2-e14", "type": "order", "promptLang": "en", "answerLang": "fi",
  "prompt": "They are at school.", "answers": ["He ovat koulussa."], "tiles": ["on"] }
```

- `prompt` is the sentence to translate (in `promptLang`). `answers` are the accepted
  sentences in `answerLang`; the first one is the one shown as the correct answer.
- The tiles are the words of `answers[0]` plus the optional `tiles`, which are
  single-word distractors. Every other accepted answer must be buildable from those
  tiles, ignoring case and final punctuation. The validator checks this.
- Use 3 to 7 words and 1 or 2 distractors. If a distractor could also make a good
  sentence, list that sentence in `answers`.
- Finnish answers and tiles are spell checked when `answerLang` is `fi`.

`translate`: the learner types a whole sentence.

```json
{ "id": "u02-l4-e14", "type": "translate", "promptLang": "en", "answerLang": "fi",
  "prompt": "My name is Anna.", "answers": ["Minun nimeni on Anna."] }
```

- `answers` lists every accepted translation. Finnish is matched exactly (case and
  final punctuation are ignored); English allows one wrong letter.
- With `answerLang` `fi` the app shows ä, ö and å buttons and the answers are spell
  checked. List every natural translation: if the learner may drop the pronoun, add
  that version too.

`truefalse`: the learner reads a short text and says whether a statement is true.

```json
{ "id": "u02-l5-e14", "type": "truefalse", "promptLang": "fi", "answerLang": "fi",
  "text": "Hän on opettaja. He ovat opiskelijoita.", "prompt": "He ovat opiskelijoita.", "answer": true }
```

- `text` is the passage and `prompt` is the statement. Both are in `promptLang`, and
  `answerLang` must equal `promptLang`. Finnish `text` and `prompt` are spell checked.
- `answer` is `true` or `false` (JSON booleans). The statement must be clearly true or
  false from the text alone. Make about half of them false.

## Case names for `form` and for rules

The checker uses these names: nominative `nimento`, genitive `omanto`, partitive
`osanto`, inessive `sisaolento`, elative `sisaeronto`, illative `sisatulento`,
adessive `ulkoolento`, ablative `ulkoeronto`, allative `ulkotulento`, essive `olento`,
translative `tulento`.

## Rules

Each grammar rule the unit teaches is one entry in `content/rules.json`:

```json
{ "id": "rektio-pitaa-sta", "type": "rektio", "unit": "u03",
  "title": "pitää + -sta/-stä (to like)",
  "verb": "pitää", "requires": "sisaeronto",
  "examples": [ { "fi": "Pidän kahvista.", "en": "I like coffee.", "word": "kahvista" } ] }
```

- Use the rule ids given in your brief. Ids have no ä or ö.
- `title` is one English line a learner can read as a reminder.
- 3 to 6 examples, each a full sentence with an English translation.
- `rektio` rules need `verb`, `requires` (a case name from the list above) and a
  `word` in every example marking the governed word.
- Tag every exercise that practises a rule: `"tags": ["rule-id"]`. Each rule needs at
  least 4 tagged exercises, and 8 or more is better. Vocabulary exercises get no tag.

## The tip

`tip.en` is a short explanation of the unit's grammar, 2 to 4 short paragraphs
separated by a blank line (`\n\n`). Plain English, with two or three Finnish examples.

## Quality rules for the Finnish

- Write standard written Finnish (yleiskieli). No spoken forms.
- Every sentence must be something a Finnish speaker would actually say. If you are
  not sure a sentence is natural, use a simpler one.
- Check each `fill` sentence for a second possible answer.
- Check that every wrong option is really wrong in that sentence.
- Be exact with ä and ö, and with double letters.
- All sentences, dialogues and examples must be your own. Do not copy from any
  textbook or website.

## Check your work

Run from the project folder:

```
node scripts/validate-content.mjs
```

It must end with `0 errors`. Read every warning: a warning means a `fill` answer is
not the form you declared, which is usually a real mistake.

The validator checks spelling and forms word by word. It cannot tell whether a
sentence is natural or whether an answer is the only right one. That is your job.

## Report back

Reply with only this, in under 150 words:

- the validator's last line
- number of exercises per lesson
- the rule ids you added, with the count of tagged exercises for each
- any sentence you are unsure is natural Finnish, quoted, with the exercise id
- anything in the brief you could not do
