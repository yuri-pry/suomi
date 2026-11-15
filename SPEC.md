---
ontology: true
type: spec
domain: suomi-app
status: active
summary: Approved spec for the Finnish study app: scope, curriculum, exercise types, scoring, architecture
tags: [spec, finnish, curriculum]
related: [plan, todo]
---

# Spec: Finnish study app ("Duolingo-style", based on the No niin! syllabus)

Status: approved. Phases 1 and 2 are built; see `tasks/todo.md`.

## 1. Rewritten prompt

> Plan a Duolingo-style web app for learning Finnish. Use the two scanned textbooks
> (No niin! 1 and No niin! 2, Finn Lectura/Otava) only as the syllabus: the order of
> grammar topics, themes and vocabulary areas. All sentences, dialogues, exercises and
> images in the app must be original, because the books are copyrighted and forbid
> digital copying.
>
> Deliver a written spec that covers:
> 1. A curriculum map from absolute beginner to B2, split into units and short
>    interactive lessons. The books cover up to B1; uusikielemme.fi supplies the topic
>    list above that.
> 2. A placement test that decides which unit a learner starts at.
> 3. Exercise types, with a content data format.
> 4. Progress tracking, an XP score system and day streaks.
> 5. Architecture and deployment: playable in the browser first, installable on
>    Android second.
> 6. UI direction, mobile first.
>
> Follow the agent-skills process (spec first, then task breakdown, then incremental
> build with tests). Use the design skills for UI decisions. Use graphify only where a
> knowledge graph helps. Stop after the spec and wait for approval before building.

## 2. Decisions (confirmed by the user on 2026-11-13)

1. Interface language is switchable between English and Finnish. The switch changes
   buttons, menus and feedback text. Translation exercises always use English as the
   other language. Grammar tips are written in English, with a Finnish version from
   section 3 upward.
2. Personal use at first: no accounts, no server, progress stored on the device.
3. Web first. Android is a sideloaded APK. No Play Store listing for now.
4. Lesson content is written new for the app. No text, images or audio is copied from
   the books or from the reference websites.
5. The target is B2. The books reach B1 (section 3), so a fifth section is built from
   a topic list taken from uusikielemme.fi (section 3a).

## 3. What the source material covers

Both PDFs are photo scans with no text layer (173 and 355 PDF pages). I read the
covers, the imprint page, both tables of contents, the book 1 preface and three sample
exercise pages. I did not read the other pages.

- No niin! 1: 12 chapters, about 340 printed pages. Starts at the alphabet and
  greetings, ends at past tense (imperfekti), negative past, object basics and
  necessity verbs.
- No niin! 2: 10 chapters, about 355 pages. Ends at passive past tenses, conditional
  perfect, participles and clause equivalents (lauseenvastikkeet).

Levels:

- Book 2: its preface states that it goes from A2 to B1, and that a committed learner
  can reach B2 with the idioms and harder structures near the end.
- Book 1: its preface states no level. Since book 2 starts at A2, book 1 covers A1 up
  to the start of A2. The split of sections 1 and 2 below is my estimate.

So the books reach intermediate (B1). Section 5 goes past them.

## 3a. The two reference websites

Checked on 2026-11-13 by fetching their pages.

**uusikielemme.fi** is an English-language reference site for Finnish grammar and
vocabulary, with more than 650 articles, run by one teacher as a hobby.

- It describes itself as reference material, not a lesson plan. Articles carry no CEFR
  labels. Its own level page lists B2 as "not covered yet".
- It does have articles on the structures that sit above B1: the five participles, the
  agent participle, infinitives 2 to 4, the four clause-equivalent constructions, the
  potential mood, the rare cases, rections, the advanced object, clitics, derivation
  and spoken Finnish.
- The only rights statement is "©2026 Uusi kielemme". No licence, no API, no download.
  So it is used the same way as the books: as a list of topics and as something to
  read while writing. No article text, tables or example sentences are copied.
- Each grammar tip in the app links to the matching article for further reading.

**kielitoimistonsanakirja.fi** is the general dictionary of standard Finnish, published
by Kotus (Institute for the Languages of Finland), with over 100,000 headwords.

- The site is a JavaScript app. Nothing loads without a browser, no API was found, and
  I could not reach its terms page, so its licence is unconfirmed. The app does not
  copy definitions or examples from it.
- Kotus publishes the dictionary's headword list separately as open data: "Nykysuomen
  sanalista", licence CC BY 4.0, a UTF-8 text file with word class, inflection type
  number and consonant gradation letter for each word. It has no definitions and no
  inflected forms.
- Not used in this project. Voikko (below) checks both dictionary forms and inflected
  forms, so the word list would be a second check of the same thing.

## 3b. Checking the Finnish with Voikko

Voikko is the open-source Finnish spelling and morphology engine. Tested on this
machine on 2026-11-13 with the npm package `voikko` 1.0.1 (a WebAssembly build with
its dictionary included, 14 MB, runs in Node with no native install).

Test result: 18 of 18 correct forms accepted, from beginner (omenaa, taloissa, syön)
to section 5 (tullessaan, tehdäkseen, lienee, rahatta). 8 of 8 misspelled or
impossible forms rejected (omenata, talossia, syöän, kirjastosa). For each accepted
word it returns the dictionary form, word class, case and number.

How the validator uses it:

1. Every Finnish word in every prompt, option and accepted answer must be accepted by
   Voikko. Names and loanwords it does not know go in a short allow list file.
2. A `fill` exercise can declare the form it teaches, for example
   `"form": { "base": "omena", "case": "osanto" }`. The validator then checks that
   Voikko analyses the answer as that form. This catches a real word in the wrong
   form (omenan where omenaa is meant), which rule 1 cannot.
3. Wrong options in `choice` exercises are exempt from rule 1 when their index is
   listed in `invalid`, since a deliberately wrong form is sometimes the point.

Limits:

- Case names come back in Voikko's own Finnish terms (osanto for partitive, omanto for
  genitive, sisaolento for inessive). The `form` field uses those terms.
- Some analyses differ from textbook labels. In the test, "omin" was read only as a
  verb form, not as the instructive of "oma", and "tultuaan" as an adjective form. A
  failed rule 2 check is therefore a warning to look at by hand, not a build failure.
- Voikko checks words, not sentences. Wrong word order, a wrong case after a given
  verb, or an unnatural sentence still pass. Those need a human reader.
- Licence: libvoikko is GPL 3. It runs only in the validator on the developer's
  machine and is not part of the app or the APK.

Exercise styles seen in the books that translate well to an app: read a short text and
mark statements true or false, write the word for a picture, pick phrases from a
dialogue, fill in the right form of a word given its dictionary form.

## 4. Curriculum map

31 units in 5 sections. Sections 1 to 4 have one unit per book chapter. Section 5 is
new. Each unit has 5 lessons of about 12 exercises (3 to 5 minutes each), plus one
unit checkpoint. Unit titles below are mine, not the books' chapter titles.

### Section 1: Starter (A1), book 1 chapters 1 to 6

| Unit | Theme and vocabulary | Grammar |
|---|---|---|
| 1 Hello | alphabet, numbers, greetings, courtesy phrases, personal details | verb olla, personal pronouns, vowel harmony |
| 2 About me | introductions, languages, nationality, home country | question words, -ko/-kö questions, verb type 1 |
| 3 Food | weather, food, measures, colours | verb type 2, verb + required case, partitive use |
| 4 Home | phone phrases, travel phrases, rooms, family, clock | "where is what" sentences (Keittiössä on pöytä), "minulla on", adjectives, more partitive |
| 5 Family | family, clothes, appearance, weekdays, months, time expressions | tämä/tuo/se, genitive, possessive suffixes |
| 6 My day | daily routine, body parts, common illnesses, emergency call, short messages | verb types 1 to 5 with consonant gradation, käydä + missä, mennä + mihin, partitive of pronouns |

### Section 2: Basics (A1 to early A2), book 1 chapters 7 to 12

| Unit | Theme and vocabulary | Grammar |
|---|---|---|
| 7 Getting around | café, transport, timetables, tickets | consonant gradation continued, partitive verbs, -ssa or -lla, mihin/missä/mistä basics |
| 8 Seasons and work | weather, seasons, opinions, hobbies, professions | word stems, more local cases, imperative, verb-to-noun |
| 9 Celebrations | calendar holidays, flag days, family celebrations | t-plural, passive present, verb + verb |
| 10 My past | what happened, personal history, CV outline | imperfekti (past tense) |
| 11 Housing problems | faults at home, calling maintenance, notices, flat adverts, dentist | negative imperfekti |
| 12 Neighbours and rules | neighbour problems, house rules, recycling, tools, ordering by phone | postpositions, object basics, pitää/täytyy/olla pakko |

### Section 3: Everyday (A2), book 2 chapters 1 to 5

| Unit | Theme and vocabulary | Grammar |
|---|---|---|
| 13 Errands | library, shops, pharmacy, post, online and phone service, making appointments | more on the object, feeling verbs, "minua väsyttää" pattern, joka pronoun |
| 14 Health | health care, medicine, accidents, booking and cancelling, emergencies | conjunctions, plural stem basics |
| 15 Parties and jobs | celebrations, work life, job adverts, invitations, recipes | plural partitive, plural genitive |
| 16 Nature and summer | nature, cottage, sauna, everyman's rights, cities, environment | olla-sentence types, osata/voida/saada, MA-infinitive |
| 17 Job hunting | talking about the past, job application, CV, interview, hobbies | perfekti, imperfekti vs perfekti, numbers and ordinals in cases |

### Section 4: Upper (B1), book 2 chapters 6 to 10

| Unit | Theme and vocabulary | Grammar |
|---|---|---|
| 18 Housing and opinions | housing, moving, giving and justifying opinions | comparison of adjectives, -ton and -llinen adjectives, conditional present, adverbs |
| 19 Work and study | motivation, wellbeing, education paths, household budget | essive and translative, pluskvamperfekti, transitive vs intransitive verbs |
| 20 Complaints | customer service problems, complaints, insurance, bullying | conditional perfect |
| 21 History and idioms | Finnish history, idioms, comparing countries | passive imperfekti, passive perfekti |
| 22 Storytelling | recounting events, time expressions, stories | clause equivalents, participles |

### Section 5: Advanced (towards B2), topics from uusikielemme.fi

The grammar order and the themes here are my proposal, accepted by the user. No
textbook backs this sequence.

| Unit | Theme and vocabulary | Grammar |
|---|---|---|
| 23 In the news | news headlines, media, current events | participles as adjectives: -va, -nut, -tava, -tu |
| 24 Who did it | reports, descriptions of people and things | agent participle (äidin leipoma kakku) |
| 25 They say that | rumours, reported speech, formal reports | referative construction in place of an että-clause |
| 26 While and after | biographies, sequences of events | temporal constructions (tullessaan, tultuaan), second infinitive (tehden) |
| 27 In order to | goals, plans, instructions, official forms | long first infinitive (tehdäkseen), third infinitive forms, -minen nouns |
| 28 Probably | forecasts, formal announcements, bureaucracy | potential mood (lienee, tehnee) |
| 29 Without and with | fixed expressions, proverbs, written style | abessive, comitative, instructive |
| 30 Verbs and their cases | opinion writing, argument, feelings | verb and adjective rections, advanced object rules |
| 31 How people really talk | everyday speech, messaging, tone | clitics -han, -kin/-kaan, -pa; spoken Finnish forms; word derivation |

Limit: grammar and reading exercises alone do not make a B2 speaker. B2 also needs
wide vocabulary, listening to real speech, and speaking and writing practice, which
this app does not give. Section 5 teaches the B2 structures and how to recognise them.

### Lesson pattern inside a unit

Every unit follows the same pattern, so the learner always knows what comes next:

1. Words: the unit's core vocabulary (`match`, `choice`, `listen`).
2. Grammar A: the first structure, recognise it and then produce it (`choice`, `fill`).
3. Grammar B: the second structure, same approach. Units with one structure use this
   lesson for more vocabulary.
4. Situation: an original short dialogue or text from the unit's theme (`truefalse`,
   `order`, `translate`).
5. Mix: everything from the unit, plus a few items from earlier units.
6. Checkpoint: 15 items drawn from lessons 1 to 5 of the unit. Pass at 80 percent.

Unit 3 (Food) as the worked example:

| Lesson | Content |
|---|---|
| 1 Words | 20 food and drink words, 8 colours |
| 2 Grammar A | verb type 2 in all persons: syödä, juoda, tuoda, käydä |
| 3 Grammar B | partitive after syödä and juoda, and after numbers and measures (kaksi omenaa, litra maitoa) |
| 4 Situation | ordering in a café: an original dialogue, true or false questions, build the order sentence |
| 5 Mix | food, colours, verb type 2, partitive, plus verb type 1 and -ko/-kö questions from unit 2 |
| 6 Checkpoint | 15 items from lessons 1 to 5 |

## 5. Lessons and exercise types

Each lesson is a fixed list of exercises. A wrong answer goes to the end of the lesson
queue and must be answered correctly to finish.

| Type | What the learner does | Used for |
|---|---|---|
| `choice` | pick one of 3 or 4 answers | vocabulary, grammar form |
| `match` | pair 4 or 5 Finnish and English words | vocabulary |
| `order` | tap word tiles into the right order | sentence structure |
| `fill` | type the missing word; dictionary form shown as a hint | case endings, verb forms |
| `translate` | type the Finnish or English for a sentence | production |
| `listen` | hear Finnish, then type or pick what was said | listening |
| `truefalse` | read a short original text, judge a statement | reading |

Seven types is the whole list for version 1. Speaking exercises are skipped.

Each lesson opens with an optional one-screen grammar tip (rule plus two examples).

### Content format

One JSON file per unit, loaded on demand.

```json
{
  "id": "u03",
  "section": 1,
  "title": "Food",
  "tip": "…",
  "lessons": [
    {
      "id": "u03-l1",
      "exercises": [
        { "id": "u03-l1-e1", "type": "choice", "tags": ["partitive"],
          "promptLang": "en", "answerLang": "fi",
          "prompt": "I drink coffee.", "options": ["Juon kahvia.", "Juon kahvi.", "Juon kahvin."],
          "answer": 0 },
        { "id": "u03-l1-e2", "type": "fill", "tags": ["partitive"],
          "promptLang": "fi", "answerLang": "fi",
          "prompt": "Syön ___.", "hint": "omena", "answers": ["omenaa"],
          "form": { "base": "omena", "case": "osanto" } }
      ]
    }
  ]
}
```

Fields as built in phase 1 (`src/lib/types.ts` is the reference):

- `promptLang` and `answerLang` (`fi` or `en`) are required. The validator uses them
  to know which text to check with Voikko, and the app uses `answerLang` to decide
  whether a typo is tolerated.
- `hint` is shown under a `fill` sentence and is not checked, so it can be in English.
- `form` can also describe a verb: `{ "base": "olla", "person": "1", "number": "singular" }`.
- `invalid` on a `choice` is a list of option indices that are deliberately not real
  words, for example `"invalid": [1]`.
- Options are shuffled when shown, so `answer` can always point at the first option.

Checkpoints have no content of their own: the app draws 15 exercises from the unit's
lessons. The placement bank is one more file, `content/placement.json`, holding
exercises in the same shape with an added `"unit": "u03"` field.

A small script validates every content file (ids unique, answer index in range, at
least one accepted answer, 3 placement items per unit, and the Voikko checks from
section 3b) and runs in the test command.

### Checking typed answers

- Normalise before comparing: trim, lower case, collapse spaces, drop final punctuation.
- `answers` lists every accepted variant.
- ä and ö are never treated as a and o, because they change the word. The typing
  screen shows ä, ö and å buttons for keyboards without them.
- Finnish answers must match exactly after normalisation. One letter is often a
  different case or a different word, so there is no typo tolerance for Finnish.
- English answers accept one wrong letter and show it as a typo.

### Audio

Listening uses the browser's speech synthesis with a Finnish (fi-FI) voice. A Finnish
voice is not present on every device, so the app checks at start-up and leaves out
`listen` exercises when none is found. Recorded audio is not planned.

Tested 2026-11-14: this PC (Chrome) has a Finnish voice. The Android WebView inside the APK
has no `speechSynthesis` at all, so the APK speaks through a small native plugin
(`TtsPlugin.java`) that wraps Android's text-to-speech; the user confirmed voice works in the
APK and in the installed PWA on their phone. Any Finnish word shown in a lesson can be tapped
to hear it.

## 6. Placement test

- Offered on first launch, with "start from the beginning" as the other choice. Can be
  retaken from settings.
- Item bank: 3 items per unit (93 total), each tagged with its unit. Types `choice`
  and `fill` only, so it is quick. With 3-option `choice` items a guesser passes a
  block about a quarter of the time, so at least 2 of the 3 items per unit are `fill`.
- Adaptive, in blocks: the test asks all 3 items of one unit. 2 or 3 correct is a
  pass for that unit.
- Search: a binary search for the lowest unit the learner fails, assuming that a
  learner who fails a unit would also fail the later ones. Keep `lo = 1` and
  `hi = 32` (32 means "passed everything"). Test unit `mid = floor((lo + hi) / 2)`.
  On a pass set `lo = mid + 1`, on a fail set `hi = mid`. Stop when `lo = hi`.
- Length: at most 5 blocks, so 15 items. No unit is tested twice, so the bank cannot
  run out.
- Result: the start unit is `lo`, capped at 31. Floor: a learner who fails every
  block starts at unit 1. Ceiling: a learner who passes every block starts at unit
  31. All earlier units are marked "tested out" and stay open for review.
- Every item has an "I don't know" button, counted as wrong, so nobody has to guess.
- The test gives no XP.

## 7. Score, streak and progress

- XP: 10 for a finished lesson, plus 5 if it had no mistakes. 5 for a review session.
  20 for a unit checkpoint.
- Streak: a day counts when at least one lesson or review is finished on that local
  calendar day. Missing a day resets the streak to 0. The longest streak is kept.
- Daily goal: one setting (10, 20 or 30 XP), shown as a ring on the home screen.
- Unlocking: lessons unlock in order inside a unit. The next unit unlocks when the
  checkpoint is passed at 80 percent.
- Review: every wrong answer puts its exercise id into a spaced-repetition deck, due
  the same day. A right answer in a review session moves the item up one box, with
  intervals of 1, 3, 7, 14 and 30 days; after the last box it leaves the deck. A wrong
  answer sends it back to the first box, due the same day. A session plays at most 15
  due items.
- Not in version 1: hearts or lives, leagues, friends, streak freezes, gems, accounts.

### Rulebook

Every grammar rule the content teaches is one entry in `content/rules.json`. The
rulebook is compiled while the content is written: a unit cannot use a rule id that
is not in the file.

```json
{ "id": "rektio-pitaa-sta", "type": "rektio", "unit": "u03",
  "title": "pitää + -sta/-stä (to like)",
  "verb": "pitää", "requires": "sisaeronto",
  "examples": [ { "fi": "Pidän kahvista.", "en": "I like coffee.", "word": "kahvista" } ] }
```

- The plan of which rules each unit adds, about 230 in all, is in
  `tasks/rulebook-map.md`. It was built from the books' contents and the grammar
  index of uusikielemme.fi.
- A `rektio` rule can demand a case (`requires`), an infinitive (`requiresMood`) or
  both, for example mennä + MA-infinitive in the illative (mennä uimaan).
- A rule may carry `ref`, a link to further reading.
- Types: `rektio` (which case or infinitive a verb, adjective or noun demands), `case`
  (when a case is used), `verbtype`, `wordtype` (how a noun type builds its stem),
  `gradation` (consonant gradation), `phonology` (vowel harmony), `sentence`
  (sentence types), `object`, `tense`, `mood`,
  `construction` (participles, clause equivalents), `clitic`.
- Every exercise that practises a rule lists the rule id in its `tags`. Vocabulary
  exercises have no rule tag.
- Validator: every tag must exist in the rulebook, every rule needs at least 4
  exercises, and for a `rektio` rule Voikko must analyse each example's marked `word`
  as the case named in `requires`.
- Rules screen: a searchable list of the rules from the units the learner has opened,
  grouped by type, each with its examples and its mastery bar. The `rektio` group
  reads as a personal verb-and-case table.

### Mastery per rule

The app keeps two numbers per rule: `n` (answers given) and `s` (score from 0 to 1).
After each answer to an exercise tagged with the rule:

```
s = 0.8 * s + 0.2 * (1 if correct, 0 if wrong)      starting from s = 0
```

Recent answers count more than old ones. Ten correct answers in a row give 0.89; one
mistake then drops it to 0.71.

- A rule is mastered when `s >= 0.8` and `n >= 8`.
- Units skipped by the placement test start their rules at `s = 0.8, n = 8`, so they
  count as mastered until review shows otherwise.
- Review order: the saved mistakes first, then exercises for the rules with the
  lowest `s` among rules already seen.

### Level formula

- Section mastery = mastered rules in the section / all rules in the section.
- A section is complete at 80 percent mastery.
- Level = number of sections complete in order from section 1, plus the mastery
  fraction of the first incomplete one. Example: sections 1 and 2 complete and
  section 3 at 40 percent gives level 2.4 of 5.
- The home screen shows the level number and the section name. It also shows the
  count of mastered rules out of all rules.
- XP measures effort and never drops. Level measures knowledge and can drop when
  rules are forgotten.

The thresholds (0.8 weight, 8 answers, 80 percent) are starting values with no data
behind them. They are constants in one file and should be tuned after real use.

### Storage

One JSON object in `localStorage` under a single versioned key:

```json
{ "v": 1, "xp": 0, "streak": { "count": 0, "best": 0, "lastDay": "2026-11-13" },
  "goal": 20, "done": { "u01-l1": { "best": 12, "at": "2026-11-13" } },
  "testedOutBefore": "u01", "mistakes": { "u03-l1-e2": 1 },
  "review": { "u03-l1-e2": { "box": 1, "due": "2026-11-16" } },
  "rules": { "rektio-pitaa-sta": { "n": 9, "s": 0.84 } } }
```

Settings include export and import of this object as a file, because local storage is
lost when browser data is cleared and does not move between devices. Cloud sync is not
planned.

## 8. Architecture and deployment

- Stack: Vite, React, TypeScript, plain CSS with custom properties. No UI library, no
  state library, no router library (five screens, switched by state).
- PWA: web manifest plus a service worker (vite-plugin-pwa) so it installs on Android
  from Chrome and works offline.
- Hosting: any static host (GitHub Pages or Cloudflare Pages). No backend.
- Android APK: wrap the built site with Capacitor, which packs the files into the APK
  so it runs with no hosting and no network. Built locally with the Android SDK and
  installed by sideloading. A debug-signed APK is enough for personal use.
- The APK and the browser keep separate progress, because each has its own storage.
  Export and import (section 7) moves progress between them.
- Interface text lives in one file, `src/lib/strings.ts`, with an `en` and a `fi`
  entry per key. No translation library.

```
suomi-app/
  SPEC.md
  content/        unit JSON files, placement item bank
  scripts/        validate-content.mjs (uses voikko, a dev dependency), allowlist.txt
  src/
    screens/      Home (path), Lesson, Result, Placement, Rules, Settings
    exercises/    one component per exercise type
    lib/          progress.ts, mastery.ts, check.ts, placement.ts, speech.ts
  tests/          unit tests for lib/ and the content validator
```

Commands (once scaffolded):

```
Dev:   npm run dev
Build: npm run build
Test:  npm test
Lint:  npm run lint
```

### Testing

Vitest unit tests for the logic that can be wrong silently: answer checking, streak
day rollover, XP, unlock rules, the placement staircase and the content validator.
One browser smoke test: finish lesson 1 and see XP and streak change.

## 9. UI direction

- Mobile first, one column, thumb-reach primary button fixed at the bottom. Desktop
  shows the same column centred.
- Home is a vertical path of lesson nodes grouped by unit, with XP, streak flame and
  the daily goal ring in the header.
- Lesson screen: progress bar on top, one exercise, one "Check" button. Feedback is a
  bottom sheet coloured for right or wrong, with the correct answer shown.
- Motion: buttons scale to 0.97 on press (about 150 ms, ease-out). The feedback sheet
  slides up in about 200 ms. Celebration animation only on the lesson result screen,
  since that is seen rarely. No animation on answer selection, which happens
  constantly. Movement is removed under `prefers-reduced-motion`.
- Touch targets at least 44 px. Hover styles only on devices with a real pointer.
  Inputs use 16 px text so mobile browsers do not zoom.
- Colour never carries meaning alone: right and wrong also get an icon and text.
  Light and dark themes through CSS custom properties.
- Own visual identity. No Duolingo mascot, colours, sounds or artwork.

## 10. Boundaries

- Always: write original content; run tests and the content validator before a
  release; keep progress data backward compatible through the `v` field.
- Ask first: adding a dependency, adding a backend or accounts, publishing to a public
  URL or app store.
- Never: copy text, pictures or audio from the books into the app or the repository;
  commit the PDFs.

## 11. Milestones

1. Skeleton: Vite app, content loader, `choice` and `fill` exercises, unit 1 content,
   lesson flow end to end.
2. Progress: XP, streak, daily goal, unlocking, local storage, export and import.
3. Remaining exercise types, speech with the voice check, mistake review.
4. Placement test with its item bank.
5. Content for Section 1 (units 1 to 6), then PWA install, first deploy and first APK.
   The Voikko validator is built in milestone 1, before any content is written.
6. Content for Sections 2 to 4, one section at a time.
7. Content for Section 5.

Content is the largest part of the work: about 31 units x 5 lessons x 12 exercises is
around 1,900 exercises, plus 93 placement items.

## 12. Success criteria

- A new learner can install the app on an Android phone from the browser, take the
  placement test and land on a unit.
- Finishing a lesson offline updates XP and streak, and both survive a restart.
- The APK installs on an Android phone and runs a lesson in flight mode.
- Answering exercises changes the mastery of their rules, and the level on the home
  screen follows the formula in section 7.
- The Rules screen lists every rule of the opened units with examples.
- Switching the interface between English and Finnish changes every button and label.
- Every unit in all five sections has lessons, a tip and a checkpoint, and all content files
  pass the validator.
- All logic tests pass.

## 13. Open questions

1. Sentence-level Finnish (word order, the right case after a verb, natural phrasing)
   is not machine checked. Someone who knows Finnish should read each unit before it
   is trusted.
2. Before any public release: ask uusikielemme.fi for permission to link per topic,
   and read the dictionary's terms page in a browser.
