# Writing a content unit

Everything a writer needs to produce one unit. You do not need any other project
file except the ones named here.

## What you produce

1. `content/uNN.json`: the unit, with 5 lessons of 12 to 14 exercises each.
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
